# MMM-Notion-Tasks

WORK IN PROGRESS, NOT READY FOR USE

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

This module displays a [Notion Task Database](https://www.notion.com/help/sprints#create-a-task-database).

## Installation

In ~/MagicMirror/modules

```sh
git clone https://github.com/JHWelch/MMM-Notion-Tasks.git

npm install --omit=dev
```

## Inspiration

This project takes some inspiration from [SyncTasks](https://www.synctasks.app/) on iOS, which is a great companion to this.

## Obtaining Notion Secrets

### Notion API Key

1. Open [Notion Integrations](https://www.notion.so/profile/integrations)
2. Click "New Integration"
3. Fill out Details
   1. Name: Anything (MMM)
   2. Associated workspace: Pick target workspace
   3. Type: Internal
   4. Click Save
4. Click "Configure integration settings"
5. Copy "Internal Integration secret" for use in config (`notionToken`)
6. Set "Capabilities" this app only requires
   1. Content Capabilities: Read Content
   2. User Capabilities: Read user information without email address
7. In "Access" tab edit access and select your task database.

### Data Source Id

1. Open the page of your Task database.
2. Open the table menu and select "Manage Data Sources"
3. Select the desired data source and "Copy data source ID"
4. Save for use in config (`dataSourceId`)

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
var config = {
  modules: [
    {
      module: 'MMM-Notion-Tasks',
      position: "bottom_left",
      config: {
        dataSourceId: "a5141993-19c4-497b-8ad4-042b8bc2e5d0",
        notionToken: "ntn_AdY9TfWZZVQlOtWbYlNvmFatvSDDSsnjcfquwhECPxjiIv",
        // See below for optional configuration values
      }
    }
  ]
}
```

| Option           | Required?    | Description                                                            |
| ---------------- | ------------ | ---------------------------------------------------------------------- |
| `notionToken`    | **Required** | See [Notion API Key](#notion-api-key)                                  |
| `dataSourceId`   | **Required** | See [Data Source Id](#data-source-id)                                  |
| `updateInterval` | *Optional*   | Refresh time in milliseconds <br>Default 60000 milliseconds (1 minute) |
