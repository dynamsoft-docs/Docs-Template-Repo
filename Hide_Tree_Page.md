<div id="version_tree_list">
    {%- assign validVerInfo = site.data.product_version.version_info_list -%}
    {%- for verInfo in validVerInfo -%}
        {%- assign curId = "version_tree_" | append: verInfo | replace: " ", "_" | downcase -%}
        <span id="{{ curId }}">
            {%- include liquid_searchVersionTreeFile.html ver=verInfo curPath="" targetRelativePath="sidelist-fullTree.html" -%}
        </span>
    {%- endfor -%}
</div>
