# frozen_string_literal: true

class CheckJobExist
  def initialize(worker)
    @worker = worker
  end

  def call
    job.present?
  end

  def jid
    return if job.blank?

    @jid ||= job['jid']
  end

  private

  def jobs
    return @jobs if @jobs.present?

    @jobs = []
    namespace_jids = Sidekiq.redis { |conn| conn.keys('sidekiq:status:*') }
    jids = namespace_jids.map { |id_namespace| id_namespace.split(':').last }
    jids.each do |jid|
      @jobs.push Sidekiq::Status.get_all(jid)
    end
    @jobs
  end

  def job
    @job ||= jobs.find { |q| q['worker'] == @worker.to_s && q['status'] != 'complete' }
  end
end
