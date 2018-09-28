class HomeController < AuthenticatedController
  def index
    I18n.backend.send(:init_translations)
  end
end
