# Chrome Extension

## Installation and launch

1. Download zip-archive
2. Unpack zip-archive
3. Upload it in Google Chrome Extension Manager by click "Load unpacked" (need to turn on developer mode)

## Versions

v 1.4.21

-   Tooltips added for better user experience

v 1.4.20

-   Added a check, if the list is not from google table, then the button for adding comments will not be displayed in the submenu, if the search was through word and not through the list, then only the screenshot button will be displayed in the submenu

v 1.4.19

-   Optimised highlighting function

v 1.4.18

-   Updated the logic for making changes to the hum table using AppsScript

v 1.4.17

-   When changing the list, the values of word lecID and stringID are saved

v 1.4.16

-   When a screenshot is taken, it is saved in a google table under Lec ID + .png and downloaded with the same name

v 1.4.15

-   Fixed function to paste text into the list

v 1.4.14

-   Status selection adapted for word search by attributes
-   Fixed function to paste text into the list
-   Counter's counting process improved

v 1.4.11

-   Fixed import words from .txt file
-   Added additional button for better navigation
-   Main logo now redirects user to the main page

v 1.4.8

-   When you give a status to a row, it immediately sends it directly to the google table in the Status column

v 1.4.7

-   Google table synchronizes with the list every 15 minutes by id from the list updating the rows in it
-   Added button in popup.html to manually synchronize listings with google table
-   The setInterval function has been changed to chrome.alarms due to google chrome's limitation on setInterval

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
