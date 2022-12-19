
import { ViewPlugin } from "@remixproject/engine-web";
import React from "react";
import { setCanUseApp, setLoading, setRepoName } from "../state/payload";
import { gitActionDispatch } from "../types";
import { diffFiles, getBranches, getFileStatusMatrix, getRemotes, gitlog, setPlugin } from "./gitactions";

let plugin: ViewPlugin, dispatch: React.Dispatch<gitActionDispatch>
let callBackEnabled: boolean = false
let syncTimer: NodeJS.Timer = null

export const setCallBacks = (viewPlugin: ViewPlugin, dispatcher: React.Dispatch<gitActionDispatch>) => {
    plugin = viewPlugin
    dispatch = dispatcher

    setPlugin(viewPlugin, dispatcher)

    plugin.on("fileManager", "fileSaved", async (e) => {
        await synTimerStart();
    });

    plugin.on('dGitProvider', 'checkout' as any, async () => {
        await synTimerStart();
    })
    plugin.on('dGitProvider', 'branch' as any, async () => {
        await synTimerStart();
    })

    plugin.on("fileManager", "fileAdded", async (e) => {
        await synTimerStart();
    });

    plugin.on("fileManager", "fileRemoved", async (e) => {
        await synTimerStart();
    });

    plugin.on("fileManager", "currentFileChanged", async (e) => {
        await synTimerStart();
    });

    plugin.on("fileManager", "fileRenamed", async (oldfile, newfile) => {
        await synTimerStart();
    });

    plugin.on("filePanel", "setWorkspace", async (x: any) => {
        await synTimerStart();
    });

    plugin.on("filePanel", "deleteWorkspace" as any, async (x: any) => {
        await synTimerStart();
    });

    plugin.on("filePanel", "renameWorkspace" as any, async (x: any) => {
        await synTimerStart();
    });

    plugin.on('dGitProvider', 'checkout', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'init', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'add', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'rm', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'commit', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'branch', async () => {
        await loadFiles();
    })
    plugin.on('dGitProvider', 'clone', async () => {
        await loadFiles();
    })


    callBackEnabled = true;
}

const syncFromWorkspace = async (isLocalhost = false) => {
    console.log("syncFromWorkspace")
    dispatch(setLoading(true));
    await disableCallBacks();
    if (isLocalhost) {
        dispatch(setCanUseApp(false));
        dispatch(setLoading(false));
        await enableCallBacks();
        return;
    }
    try {
        const workspace = await plugin.call(
            "filePanel",
            "getCurrentWorkspace"
        );
        if (workspace.isLocalhost) {
            dispatch(setCanUseApp(false));
            await enableCallBacks();
            return
        }

        dispatch(setRepoName(workspace.name));
        dispatch(setCanUseApp(true));
    } catch (e) {
        dispatch(setCanUseApp(false));
    }
    await loadFiles();
    await enableCallBacks();
}

export const loadFiles = async () => {
    console.log("loadFiles")
    dispatch(setLoading(true));

    try {
        await getFileStatusMatrix();
    } catch (e) {
        // TODO: handle error
        console.error(e);
    }
    try {
        await gitlog();
    } catch (e) { }
    try {
        await getBranches();
    } catch (e) { }
    try {
        await getRemotes();
    } catch (e) { }
    try {
        await getStorageUsed();
    } catch (e) { }
    try {
        await diffFiles('');
    } catch (e) { }
    dispatch(setLoading(false));
}

const getStorageUsed = async () => {
    try {
        const storageUsed = await plugin.call("storage" as any, "getStorage" as any);
    } catch (e) {
        const storage: string = await plugin.call("dGitProvider", "localStorageUsed" as any);
        const storageUsed = {
            usage: parseFloat(storage) * 1000,
            quota: 10000000,
        };
    }
}



export const disableCallBacks = async () => {
    callBackEnabled = false;
}
export const enableCallBacks = async () => {
    callBackEnabled = true;
}

const synTimerStart = async () => {
    if(!callBackEnabled) return
    console.log('synTimerStart')
    clearTimeout(syncTimer)
    syncTimer = setTimeout(async () => {
        await syncFromWorkspace();
    }, 3000)
}