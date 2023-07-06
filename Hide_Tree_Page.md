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
        {%- if site.data.product_version.useGroupedVersion -%}
            {%- for verInfo in validVerInfo -%}
                {%- if verInfo.child -%}
                    {%- for childVersion in verInfo.child -%}
                        {%- assign c_version = childVersion | downcase | strip -%}
                        {%- if c_version contains '_' -%}
                            {%- assign arr = childVersion | split: "_" -%}
                            {%- assign c_version = arr.first -%}
                        {%- endif -%}
                        {%- assign curId = "version_tree_" | append: c_version | replace: " ", "_" | downcase -%}
                        <ul class="version-tree-container " id="{{ curId }}">
                            {%- include liquid_searchVersionTreeFile.html ver=childVersion curPath="" targetRelativePath="sidelist-full-tree.html" -%}
                        </ul>
                    {%- endfor -%}
                {%- else -%}
                    {%- assign curId = "version_tree_" | append: verInfo.value | replace: " ", "_" | downcase -%}
                    <ul class="version-tree-container " id="{{ curId }}">
                    {%- include liquid_searchVersionTreeFile.html ver=verInfo.value curPath="" targetRelativePath="sidelist-full-tree.html" -%}
                    </ul>
                {%- endif -%}
            {%- endfor -%}
        {%- else -%}
            {%- for verInfo in validVerInfo -%}
                {%- assign curId = "version_tree_" | append: verInfo | replace: " ", "_" | downcase -%}
                <ul class="version-tree-container " id="{{ curId }}">
                {%- include liquid_searchVersionTreeFile.html ver=verInfo curPath="" targetRelativePath="sidelist-full-tree.html" -%}
                </ul>
            {%- endfor -%}
        {%- endif -%}
        <span id="complete_loading_tree"></span>
    </div>
{%- endif -%}
