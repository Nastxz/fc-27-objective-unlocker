# FC 27 Objective Unlocker

A Chrome extension that opens Ultimate Team objectives when the EA FC 27 Web App's **FC Hub** tile is locked.

It loads an available objectives category and opens it using the Web App's built-in navigation. This workaround has been confirmed working by a user on FC 27. It does not unlock server-disabled content, and the separate Season Pass service may remain unavailable.

## Install

1. On this repository's GitHub page, click **Code → Download ZIP**.
2. Extract the ZIP to a folder you will keep.
3. Open `chrome://extensions` in Chrome.
4. Turn on **Developer mode**.
5. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
6. Open the [EA FC Web App](https://www.ea.com/ea-sports-fc/ultimate-team/web-app/) and log in to your club.
7. With that tab selected, open **FC 27 Objective Unlocker** from the browser's extensions menu.
8. Click **Try opening Objectives**. Keep the popup open until the status changes, up to 10 seconds.

If an optional **Retry with local Objectives enabled** button appears, it enables the local objectives setting for that page session and tries again. Refreshing the Web App restores its normal settings.

## Update or remove

To update from FC Objectives Helper, remove the old extension, extract this version, and load the new folder. Refresh the Web App before trying it.

For future updates, replace the files in your existing installation folder, click the extension's reload button on the extensions page, and refresh the Web App.

To uninstall, click **Remove** on the extensions page. Refresh the Web App to clear any remaining local change.

## How it works

The FC Hub tile and Ultimate Team objectives use separate feature checks. The extension requests the app's objectives category list, selects an actual category ID, and invokes its built-in `easfc://fut/scmp/<category ID>` route. It avoids selecting the default Season/Meta tab. It leaves the season service's authentication unchanged.

The app may still display a Season error even when Ultimate Team objectives work. EA must provide the objective data. App updates may break compatibility.

## Permissions and privacy

- `activeTab`: temporary access to the selected tab after you open the extension.
- `scripting`: runs the navigation helper inside the EA Web App.
- No external libraries, analytics, background polling, diagnostic collection, or extension data storage.
- Does not read passwords, cookies, or session tokens, and does not automate reward claims. The EA screen retains its normal behavior, including any normal reward processing.

## Troubleshooting

If nothing opens, refresh the Web App, log in, and try again. If categories fail to load or none are available, the extension cannot create missing data. When reporting a problem, include the extension version, browser, and visible error text. Never post passwords, cookies, or session tokens.

## Version 0.4.0

- Renamed to **FC 27 Objective Unlocker**.
- Removed the loading diagnostic button, report, and diagnostic code.
- Preserved the category navigation workaround from version 0.3.0.

Unofficial community tool. Not affiliated with or endorsed by EA.
