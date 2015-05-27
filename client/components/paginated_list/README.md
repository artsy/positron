# Paginated List

A simple paginated list where the list items have a thumbnail, title, and subtitle. Re-used between the articles and verticals list view.

## Example

Include the mixin and indicate arguments (currentPage, totalPages, items, paginationParams). `items` is an array of hashes that look like `{ imgSrc: '', title: '', subtitle: '', href: '' }`.

````jade
include ../components/paginated_list/index

+paginated-list(2, 10, articles.map(...), '?published=' + published + '&')
````
