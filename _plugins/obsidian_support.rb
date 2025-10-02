# frozen_string_literal: true

require 'cgi'
require 'uri'

module AIML901
  module ObsidianSupport
    PATH_PREFIX = 'aiml901/'.freeze
    WIKI_LINK_PATTERN = /(?<embed>!)?\[\[(?<target>[^\]|]+)(?:\|(?<alias>[^\]]+))?\]\]/.freeze
    CALL_OUT_PATTERN = /^\s*>\s*\[!(?<type>[A-Za-z0-9_-]+)\s*(?:[+-])?\](?:\s*(?<title>.*))?$/i.freeze

    module_function

    def apply(page)
      return unless page.path.start_with?(PATH_PREFIX)

      page.data['layout'] ||= 'aiml901'
      page.data['banner_title'] ||= 'AIML 901'
      page.data['permalink'] ||= build_permalink(page)

      transformed = convert_callouts(page.content)
      transformed = convert_wikilinks(transformed, page)
      transformed = convert_youtube_embeds(transformed)
      page.content = transformed
    end

    def build_permalink(page)
      basename = basename_for(page)
      slug = Jekyll::Utils.slugify(basename, mode: 'latin')
      "/#{PATH_PREFIX}#{slug}/"
    end

    def convert_callouts(content)
      lines = content.split("\n", -1)
      result = []
      index = 0

      while index < lines.length
        line = lines[index]
        match = CALL_OUT_PATTERN.match(line)

        if match
          type_slug = match[:type].downcase.gsub(/[^a-z0-9-]/, '-')
          explicit_title = match[:title]&.strip

          body_lines = []
          pointer = index + 1
          while pointer < lines.length && lines[pointer].strip.start_with?('>')
            body_lines << lines[pointer].sub(/^\s*>\s?/, '')
            pointer += 1
          end

          if body_lines.empty? && explicit_title && !explicit_title.empty?
            body_lines << explicit_title
            explicit_title = nil
          end

          title_text = explicit_title&.strip
          title_text = nil if title_text&.empty?
          title_text ||= match[:type].capitalize

          callout_lines = []
          callout_lines << "> **#{title_text}**" if title_text

          body_lines.each do |body_line|
            callout_lines << "> #{body_line}"
          end

          callout_lines << "{: .aiml901-callout .aiml901-callout-#{type_slug} }"

          result.concat(callout_lines)
          index = pointer
          next
        end

        result << line
        index += 1
      end

      result.join("\n")
    end

    def convert_wikilinks(content, page)
      outside_code_transform(content) do |segment|
        segment.gsub(WIKI_LINK_PATTERN) do
          build_replacement(Regexp.last_match, page)
        end
      end
    end

    def outside_code_transform(content)
      lines = content.split("\n", -1)
      in_fence = false
      fence_marker = nil
      transformed = lines.map do |line|
        if line =~ /^\s*(```|~~~)/
          marker = Regexp.last_match(1)
          if in_fence && marker == fence_marker
            in_fence = false
            fence_marker = nil
          else
            in_fence = true
            fence_marker = marker
          end
          line
        elsif in_fence
          line
        else
          yield(line)
        end
      end
      transformed.join("\n")
    end

    def build_replacement(matchdata, page)
      site = page.site
      raw_target = matchdata[:target].strip
      alias_text = matchdata[:alias]&.strip

      target, anchor = raw_target.split('#', 2)
      target = target.strip

      is_embed = !matchdata[:embed].nil?

      ext = File.extname(target)
      attachment = attachment_target?(target, ext, is_embed)

      if attachment
        build_attachment_markup(target, alias_text, is_embed, ext)
      else
        build_page_link_markup(target, alias_text, anchor, site)
      end
    end

    def attachment_target?(target, ext, is_embed)
      return true if is_embed
      return true if target.start_with?('attachments/')
      return true if !ext.empty? && ext.downcase != '.md'
      false
    end

    def build_attachment_markup(target, alias_text, is_embed, ext)
      relative = target
      relative = relative.sub(%r{^\.?/}, '')
      relative = "attachments/#{relative}" unless relative.start_with?('attachments/')
      url = "{{ '/#{PATH_PREFIX}#{relative}' | relative_url }}"

      base_name = File.basename(target, ext.empty? ? '.md' : ext)
      embed_opts = parse_embed_alias(alias_text, base_name)
      display_name = embed_opts[:alt]

      if is_embed
        alt_text = CGI.escapeHTML(display_name.to_s)
        classes = ['aiml901-embed-image']
        attrs = ["src=\"#{url}\"", "alt=\"#{alt_text}\"", "class=\"#{classes.join(' ')}\""]
        style_rules = []
        style_rules << "width: #{embed_opts[:width]}px" if embed_opts[:width]
        style_rules << "height: #{embed_opts[:height]}px" if embed_opts[:height]
        style_rules << 'max-width: 100%'
        style_rules << 'height: auto' if embed_opts[:width] && !embed_opts[:height]
        attrs << "style=\"#{style_rules.join('; ')}\"" unless style_rules.empty?
        "<img #{attrs.join(' ')} />"
      else
        text = display_name.to_s.strip
        text = base_name if text.empty?
        "[#{text}](#{url})"
      end
    end

    def build_page_link_markup(target, alias_text, anchor, site)
      page = resolve_page(site, target)
      path = page ? page.path : default_page_path(target)
      display_text = alias_text
      display_text ||= page&.data&.fetch('title', nil)
      display_text ||= target
      display_text = display_text.strip

      anchor_fragment = anchor ? "##{slugify_heading(anchor)}" : ''
      "[#{display_text}]({% link #{path} %}#{anchor_fragment})"
    end

    def resolve_page(site, target)
      normalized = target.sub(/\.md$/i, '')
      slug = Jekyll::Utils.slugify(normalized, mode: 'latin')
      normalized_down = normalized.downcase

      site.pages.find do |candidate|
        next unless candidate.path.start_with?(PATH_PREFIX)
        base = basename_for(candidate)
        base_down = base.downcase
        title = candidate.data['title']
        candidate_slug = Jekyll::Utils.slugify(base, mode: 'latin')
        title_slug = title ? Jekyll::Utils.slugify(title, mode: 'latin') : nil

        base_down == normalized_down || candidate_slug == slug || title_slug == slug
      end
    end

    def default_page_path(target)
      normalized = target.sub(/\.md$/i, '')
      "#{PATH_PREFIX}#{normalized}.md"
    end

    def slugify_heading(text)
      Jekyll::Utils.slugify(text, mode: 'latin')
    end

    def basename_for(page)
      if page.respond_to?(:basename_without_ext)
        page.basename_without_ext
      else
        File.basename(page.path, File.extname(page.path))
      end
    end

    def parse_embed_alias(alias_text, base_name)
      result = { alt: base_name, width: nil, height: nil }
      return result unless alias_text && !alias_text.empty?

      text = alias_text.strip
      size_match = text.match(/^(?<width>\d+)(?:x(?<height>\d+))?$/i)
      if size_match
        result[:width] = size_match[:width].to_i
        result[:height] = size_match[:height]&.to_i
        return result
      end

      result[:alt] = text
      result
    end

    YOUTUBE_IMAGE_PATTERN = /!\[(?<alt>[^\]]*)\]\((?<url>[^)]+)\)/.freeze

    def convert_youtube_embeds(content)
      outside_code_transform(content) do |segment|
        segment.gsub(YOUTUBE_IMAGE_PATTERN) do
          alt = Regexp.last_match[:alt].to_s.strip
          url = Regexp.last_match[:url].strip
          if (id = extract_youtube_id(url))
            build_youtube_iframe(id, alt)
          else
            Regexp.last_match[0]
          end
        end
      end
    end

    def extract_youtube_id(url)
      uri = URI.parse(url)
      host = uri.host&.downcase
      return nil unless host&.include?('youtube.com') || host&.include?('youtu.be')

      if host.include?('youtu.be')
        uri.path.split('/').reject(&:empty?).first
      elsif uri.query
        params = URI.decode_www_form(uri.query).to_h
        params['v'] || params['si']
      elsif uri.path.include?('/embed/')
        uri.path.split('/').last
      end
    rescue URI::InvalidURIError
      nil
    end

    def build_youtube_iframe(video_id, alt)
      title = alt.empty? ? 'YouTube video' : CGI.escapeHTML(alt)
      <<~HTML.strip
        <figure class="aiml901-video">
          <div class="aiml901-video__wrapper">
            <iframe src="https://www.youtube.com/embed/#{video_id}" title="#{title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </div>
          #{alt.empty? ? '' : "<figcaption>#{title}</figcaption>"}
        </figure>
      HTML
    end
  end
end

Jekyll::Hooks.register :pages, :pre_render do |page, _payload|
  AIML901::ObsidianSupport.apply(page)
end
