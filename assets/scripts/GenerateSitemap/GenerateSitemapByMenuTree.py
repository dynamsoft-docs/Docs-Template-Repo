# -*- coding: utf-8 -*-
from urllib.parse import urljoin, urlparse, parse_qs, urlencode, urlunparse
import requests
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import argparse
import os

# python GenerateSitemapByMenuTree.py --product dbr
# python GenerateSitemapByMenuTree.py --product dcv
# python GenerateSitemapByMenuTree.py --product dcv,dbr --baseuri https://url

# target menu tree urls
paramParser = argparse.ArgumentParser(description="power shell param")
paramParser.add_argument("--product", type=str, required=True, help="you product")
paramParser.add_argument("--baseuri", type=str, help="you base uri", default="https://www.dynamsoft.com")
args = paramParser.parse_args()

WebBaseURI = args.baseuri
products = args.product.split(",")
productsUrls = {}

for product in products:
    if product == "dbr":
        productsUrls[product] = [
            f"{WebBaseURI}/barcode-reader/docs/core/Hide_Tree_Page.html",
            f"{WebBaseURI}/barcode-reader/docs/server/Hide_Tree_Page.html",
            f"{WebBaseURI}/barcode-reader/docs/mobile/Hide_Tree_Page.html",
            f"{WebBaseURI}/barcode-reader/docs/web/Hide_Tree_Page.html"
        ]
    if product == "dcv":
        productsUrls[product] = [
            f"{WebBaseURI}/capture-vision/docs/core/Hide_Tree_Page.html",
            f"{WebBaseURI}/capture-vision/docs/server/Hide_Tree_Page.html",
            f"{WebBaseURI}/capture-vision/docs/mobile/Hide_Tree_Page.html",
            f"{WebBaseURI}/capture-vision/docs/web/Hide_Tree_Page.html"
        ]

def extract_links(url, repo_type):
    try:
        response = requests.get(url, timeout=100)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        version_tree = soup.find(id="version_tree_latest_version")
        if not version_tree:
            print(f"not find id='version_tree_latest_version': {url}")
            return []
        
        liList = version_tree.find_all('li', {}, False)
        links = []
        for liItem in liList:
            lang = liItem.get('lang')
            if lang is None or lang == "":
                lang = repo_type
            temp_links = [urljoin(urljoin(WebBaseURI, a['href'].split("?")[0]), f"?lang={lang}") for a in liItem.find_all('a', href=True) if 'refreshLink' not in a.get('class', [])]
            links.extend(temp_links)

        return links
    except requests.RequestException as e:
        print(f"request error: {url} -> {e}")
        return []

def merge_urls(url_list):
    url_dict = {}

    for url in url_list:
        parsed_url = urlparse(url)
        base_url = urlunparse((parsed_url.scheme, parsed_url.netloc, parsed_url.path, '', '', ''))
        query_params = parse_qs(parsed_url.query)

        if base_url not in url_dict:
            url_dict[base_url] = {}

        for key, values in query_params.items():
            if key in url_dict[base_url]:
                url_dict[base_url][key].update(values)
            else:
                url_dict[base_url][key] = set(values)

    merged_urls = []

    for base_url, params in url_dict.items():
        merged_query = '&'.join(f"{k}={','.join(sorted(v))}" for k, v in params.items())
        merged_url = f"{base_url}?{merged_query}" if merged_query else base_url
        merged_urls.append(merged_url)

    return merged_urls

def is_docs_link(x):
    return "/docs/" in x

def get_repo_type(url):
    if "docs/server/" in url:
        return "server"
    if "docs/mobile/" in url:
        return "mobile"
    if "docs/web/" in url:
        return "javascript"
    if "docs/core/" in url:
        return "core"

def get_directory_by_product(product):
    if product=="dbr":
        return "barcode-reader/docs"
    if product == "dcv":
        return "capture-vision/docs"

def write_xml_file(directory, filename, xml_element):
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    filepath = os.path.join(directory, filename)
    
    tree = ET.ElementTree(xml_element)
    tree.write(filepath, encoding="utf-8", xml_declaration=True)
    print("menu-tree-sitemap.xml is generated.")


for item in productsUrls:
    all_links = []
    for url in productsUrls[item]:
        links = extract_links(url, get_repo_type(url))
        links = list(filter(is_docs_link, links))
        print(f"{url}:  {len(links)} links")
        all_links.extend(links)
        all_links = merge_urls(all_links)

    unique_links = list(set(all_links))

    # generate sitemap.xml
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for link in unique_links:
        url_element = ET.SubElement(urlset, "url")
        loc = ET.SubElement(url_element, "loc")
        loc.text = link

    write_xml_file(get_directory_by_product(item), "menu-tree-sitemap.xml", urlset)

