# frozen_string_literal: true

TAGS_DISABLED ||= if Rails.env.test?
                    false
                  else
                    Rails.application.secrets.tags_feature_disabled
                  end
