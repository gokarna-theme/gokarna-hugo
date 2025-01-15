---
date: {{ .Date }}
# description: ""
# image: ""
lastmod: {{ now.Format "2006-01-02" }}
showTableOfContents: false
# tags: ["",]
title: "{{ replace .File.ContentBaseName `-` ` ` | title }}"
type: "post"
---
