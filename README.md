---
title: SvelteKit
---

link example: <a href="https://svelte-hxb-sdk.vercel.app/">https://svelte-hxb-sdk.vercel.app</a>

### Create Project

```ts
  npm create svelte@latest svelte-hxb-sdk
```

### Open svelte-hxb-sdk in Visual Studio Code:

```ts
  code svelte-hxb-sdk
```

You can choose your favavite IDE

### Install packages

```ts
npm install
```

```ts
yarn add
```
### Install `hexabase package`

```ts
npm install @hexabase/hexabase-js
```

```ts
yarn add @hexabase/hexabase-js
```

### Check the `svelte.config.ts`

```ts
import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess({
    postcss: true,
  }),

  kit: {
    adapter: adapter(),
  },
};

export default config;

//It's default config, if you want to use external tools, let's add more configs
```

If you have never working with svelte or svelte-kit, please visit <a href="https://kit.svelte.dev/docs/introduction">https://kit.svelte.dev/docs/introduction</a>

## Define services

### Auth service

Firstly, create auth services to handle `login`, `logout` or `register`

For example, add `login` and `logout` functions to user.service

```tsx
// src\routes\auth\login\+page.ts

import { createClient, HexabaseClient } from "@hexabase/hexabase-js";

const url = import.meta.env.VITE_URL;
async function login(email: string, password: string) {
  console.log("import.meta", import.meta);
  let user = {} as any;
  const hexabase = await createClient({
    url,
    token: "",
    email,
    password,
  });
  const { token, error } = await hexabase.auth.login({ email, password });
  if (token && !error) {
    const { userInfo, error } = await hexabase.users.get(token);
    if (userInfo && !error) {
      user = userInfo;
      user.token = token;
    }
    localStorage.setItem("user", JSON.stringify(user));
  }
  return token;
}

async function logout() {
  const token = JSON.parse(localStorage.getItem("user")!).token;
  const hexabase = await createClient({ url, token });
  await hexabase.auth.logout(token);
  localStorage.removeItem("user");
}

export const userService = {
  login,
  logout,
};

//add other service to handle authentication
//Auth guard should be created to handle auth-related redirects or further bussiness logics
```

![login page](/static/svelte/screenshot-login.png)

## Fetching data

After login, let's get all available service.

### Get workspace

```tsx
// src\routes\workspaces\+page.ts

import { createClient, HexabaseClient } from "@hexabase/hexabase-js";
export const workspaceService = {
  getWorkspaces,
};

const url = import.meta.env.VITE_URL;

async function initHxbClient() {
  const token = JSON.parse(localStorage.getItem("user")!).token;
  const hexabase = token && (await createClient({ url, token }));
  return hexabase;
}

// get all workspaces
async function getWorkspaces() {
  const hexabase = await initHxbClient();
  console.log(hexabase);
  console.log(hexabase);
  const { workspaces, error } = await hexabase.workspaces.get();
  return workspaces;
}
```

Once get workspaces list, we can render the _`<Select />`_ to choose a specific workspace to show its detail including projects and datastores. As example bellow, workspace with name _`Ola Mundo`_ is going to be selected to be displayed.

![select worskspace](/static/svelte/screenshot-workspace.png)

### Get applications and datastores

Let's pass the `current_workspace_id` to `getProjectsAndDatastores` api to get all projects and datastore of that workspace:

```tsx
async function getAppAndDs(id: string) {
  const hexabase = await initHxbClient();
  const { appAndDs, error } =
    await hexabase.applications.getProjectsAndDatastores(id);
  return appAndDs;
}
```

<!-- ![create workspace](/img/screenshot-workspace.png)

You can create a new _`workspace`_

```tsx
//workspace.service.ts

async function createWorkspace(name: string) {
  const createWsInput = {
    name,
  };
  const hexabase = await initHxbClient();
  const { w_id, error } = await hexabase.workspaces.create(createWsInput);
  return w_id;
}
``` -->

### Create Project

You can create a new _`application`_ in current workspace

_NOTE: `application` and `project` is equivalent in terms of meaning in this context_

```tsx
import { CreateProjectPl } from "@hexabase/hexabase-js/src/lib/types/application";

async function createApp(createProjectParams: CreateProjectPl) {
  const hexabase = await initHxbClient();
  const { app, error } = await hexabase.applications.create(
    createProjectParams
  );
  return app?.project_id;
}
```

![create project](/static/svelte/screenshot-createApp.png)

You can use a template, it is optional. Then you can create site to display detail information of datastores

```tsx
//get items of a datastore
async function getItems(
  projectId: string,
  datastoreId: string,
  getItemsParameters: GetItemsPl
) {
  const hexabase = await initHxbClient();
  const { dsItems, error } = await hexabase.items.get(
    getItemsParameters,
    datastoreId,
    projectId
  );
  return dsItems;
}

//get item detail
async function getItemDetail(
  datastoreId: string,
  itemId: string,
  projectId: string,
  itemDetailParams: GetItemDetailPl
) {
  const hexabase = await initHxbClient();
  const { itemDetails, error } = await hexabase.items.getItemDetail(
    datastoreId,
    itemId,
    projectId,
    itemDetailParams
  );
  return itemDetails;
}
```

After get items from a datastore by call `getItems` function, you should call `getFields` as well, to get should-be-displayed fields according to `fields setting`.

```tsx
async function getFields(datastoreId: string, projectId: string) {
  const hexabase = await initHxbClient();
  const { dsFields, error } = await hexabase.datastores.getFields(
    datastoreId,
    projectId
  );
  return dsFields;
}
```

Click to any item to view the detail. The initial item detail automatically taken from the first elemtent of the table

![view item detail](/static/svelte/screenshot-viewItem.png)

attachments of item are displayed in `files` tab

![view item file](/static/svelte/screenshot-viewItem-file.png)

You can download those files to see it in your devices

![view item file](/static/svelte/screenshot-download-file.png)

### Delete an item

```tsx
async function deleteItem(
  projectId: string,
  datastoreId: string,
  itemId: string,
  deleteItemReq: DeleteItemReq
) {
  const hexabase = await initHxbClient();
  const { data, error } = await hexabase.items.delete(
    projectId,
    datastoreId,
    itemId,
    deleteItemReq
  );
  return data;
}
```

![delete item](/static/svelte/screenshot-deleteItem.png)

### Add an item

![create item](/static/svelte/screenshot-createItem.png)

`status` and `user_id` options should taken as follows:

```tsx
//get status list

async function getStatuses(datastoreId: string) {
  const hexabase = await initHxbClient();
  const { dsStatuses, error } = await hexabase.datastores.getStatuses(
    datastoreId
  );
  return dsStatuses;
}
```

`get user_id list` has not available, so you now just can take an user_id from items data

New `item id` is taken from an api:

```tsx
async function createItemId(datastoreId: string) {
  const hexabase = await initHxbClient();
  const { item_id, error } = await hexabase.items.createItemId(datastoreId);
  return item_id;
}

const newItemPl = {
  action_id: actionIdCreate,
  item: createItemParams,
  ...,
};

// createItemParams should be an object contains what is up for an new item
{
  field1_id: value1,
  field2_id: value2
}
```

#### Upload file

`uploadFile service` is taken immediately when user change input of `file field`. But it will not automatically add the new created `file id` to new item payload, untill `createItem service` is fired!

Let's upload a file with below params

```tsx
const payload = {
  contentTypeFile: contentTypeFile,
  filename: nameFile,
  filepath: `${datastoreId}/${itemId}/${fieldId}/${nameFile}`,
  d_id: datastoreId,
  p_id: projectId,
  item_id: itemId,
  display_order: 0,
  field_id: fieldId,
  content: content, //result as base64 format
};
```

To be uploaded image need converting to `base64` format, so let create an helper function.

```tsx
// src\lib\helper.ts

const toBase64 = (file: any) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export { toBase64 };
```

Beside to those inputs, other config in payload should be done logically

```tsx
async function createItem(
  projectId: string,
  datastoreId: string,
  newItemPl: CreateNewItemPl
) {
  const hexabase = await initHxbClient();
  const { itemNew, error } = await hexabase.items.create(
    projectId,
    datastoreId,
    newItemPl
  );
  return itemNew;
}
```

### Edit item

![update item](/static/svelte/screenshot-updateItem.png)

Let's take a look at what are needed to `update an item`

```tsx
async function updateItem(
  projectId: string,
  datastoreId: string,
  itemId: string,
  itemActionParameters: ItemActionParameters
) {
  const hexabase = await initHxbClient();
  const { data, error } = await hexabase.items.update(
    projectId,
    datastoreId,
    itemId,
    itemActionParameters
  );
  return data;
}
```

```tsx
// Overall the last payload will look like this

const itemActionParameters: ItemActionParameters = {
  changes: updateItemData,
  action_id: updateId,
  history: {
    datastore_id: item.d_id,
    action_id: updateId,
  },
  rev_no: Number(item.rev_no),
};
```

`rev_no` should be taken from `itemdetail` service while `changes` object is more complicated. It would stands for `item data` _after edited_

```tsx
objectChange = {
  as_title: field?.as_title,
  cols: fieldLayout.size_x,
  dataType: "file",
  id: field.id,
  idx,
  rowHeight: "item.rowHeight",
  rows: fieldLayout.size_y,
  status: field.status,
  tabindex,
  title: title,
  unique: field?.unique,
  x: fieldLayout.col,
  y: fieldLayout.row,
  post_file_ids: value ? [...fileIds, value] : [...fileIds],
  value: value ? [...fileIds, value] : [...fileIds],
};
//field and fieldLayout are perspectively field of layoutSettings and layoutField which alos has data_type of 'file'

//`tabIndex` and `idx` will be calculated as follows

tabindex = (fieldIdLayout.row + 1) * 10 + fieldIdLayout.col;

//fieldIdLayout is field settings of chosen filed, `find` from fieldLayout list, taken from getFields api (datastore service)

const fieldSettings = await datastoreService.getDetail(this.ds_id);
const idx = fieldSettings.fields.find(
  (s: any) => s.id === field.field_id
).field_index;

// fieldSettings taken from api getDetail of datastore services.
// field is input specific element of one item

const layoutSettings = await datastoreService.getDetail(item.d_id);
const fieldLayout = layoutSettings.field_layout.find(
  (f: any) => f.id === field.id
);
const field = layoutSettings.fields.find((f: any) => f.id === field.id);

// value is from the field which has data_type of 'file' in itemDetail data
// fieldIds is an array of existed file's id
```

Notice that if want to delete existed files when editing an item, the `fileIds` also need to updated before do `update item` service
