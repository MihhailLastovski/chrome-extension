# Chrome Extension

## Installation and launch

1. Download zip-archive
2. Unpack zip-archive
3. Upload it in Google Chrome Extension Manager by click "Load unpacked" (need to turn on developer mode)

## Versions

v 1.4.6

-   Google table synchronizes with the list every 15 minutes by id from the list updating the rows in it
-   Added button in popup.html to manually synchronize listings with google table

v 1.4.4

-   Word highlighting process optimized for faster and smoother user expirience

v 1.4.3

-   Extension searchs and highlights elements with expected values in attributes
-   Highlighting allows to show the expected line and highlighted item in a screenshot
-   Extension icon has a different counter indication for elements with strings in their attributes
-   The extension's user interface allows you to list items and attributes that should be in the search area

v 1.3.1

-   String ID, Core String and Status are taken from google sheet using AppScript
-   Note adds to steps column in google sheet

v 1.2.8

-   Contents of contentScript are separated into different module. File paths are updated
-   CSS separated from contentScript to a separate css file
-   Code is refactored. Asynchronous functions call optimised. Bugs are fixed

v 1.2.5

-   Added possibility to change the default screenshot name
-   Fixed a bug with highlighting a single word by using the input field

v 1.2.3

-   Fixed a bug with highlighting a deleted word from the list
-   Fixed a bug with screenshot and highlighting

v 1.2.1

-   Highlighting works on page loading and updating when extension is closed
-   Highlighting principle has been changed

v 1.1.5

-   About menu expanded

v 1.1.4

-   Status related bug in the update list menu is fixed
-   Submenu displays statuses accordingly

v 1.1.2

-   Added changelog
-   Highlighting works in iframe
