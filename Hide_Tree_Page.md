---
layout: tree-layout
---

{%- if site.useVersionTree -%}
    <div id="version_tree_list">
        {%- if site.edition -%}
            {%- if site.edition == 'algorithm' -%}
                {%- assign validVerInfo = site.data.product_version.version_info_list_algorithm -%}
            {%- elsif site.edition == 'js' -%}
                {%- assign validVerInfo = site.data.product_version.version_info_list_js -%}
            {%- elsif site.edition == 'mobile' -%}
                {%- assign validVerInfo = site.data.product_version.version_info_list_mobile -%}
            {%- else -%}
                {%- assign validVerInfo = site.data.product_version.version_info_list_desktop -%}
            {%- endif -%}
        {%- else -%}
            {%- assign validVerInfo = site.data.product_version.version_info_list -%}
        {%- endif -%}
        {%- for verInfo in validVerInfo -%}
            {%- assign curId = "version_tree_" | append: verInfo | replace: " ", "_" | downcase -%}
            <ul class="version-tree-container " id="{{ curId }}">
            {%- include liquid_searchVersionTreeFile.html ver=verInfo curPath="" targetRelativePath="sidelist-full-tree.html" -%}
            </ul>
        {%- endfor -%}
        <span id="complete_loading_tree"></span>
    </div>
{%- endif -%}
