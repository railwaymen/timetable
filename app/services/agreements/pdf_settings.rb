# frozen_string_literal: true

module Agreements
  module PdfSettings
    FONT_PATH = Rails.root.join('app/assets/fonts')

    def font_settings
      @pdf.font_families.update('Roboto' => {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Bold.ttf',
        italic: 'Roboto-Italic.ttf',
        bold_italic: 'Roboto-BoldItalic.ttf'
      }.transform_values(&method(:font_path)))
      @pdf.font 'Roboto'
      @pdf.font_size 11
      @pdf.default_leading 6
    end

    def font_path(font)
      File.join(FONT_PATH, font)
    end
  end
end
