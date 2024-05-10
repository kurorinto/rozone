import { Storage } from "@plasmohq/storage";
import { DEV_EXTENSION_ID, EXTENSION_ID } from "~constants";
import type { Rule } from "~devtools/panels";

export interface RozoneStorage {
  rules: Rule[]
  currentId?: number
}

const storage = new Storage()

const STORAGE_KEY = 'rozone'

const getCacheData = async (): Promise<RozoneStorage> => {
  const cacheJSON = await storage.get(STORAGE_KEY)
  return cacheJSON ? JSON.parse(cacheJSON) : {}
}

export function getCache<T extends keyof RozoneStorage>(name: T): Promise<RozoneStorage[T]>;
export function getCache(): Promise<RozoneStorage>;
export async function getCache<T extends keyof RozoneStorage>(name?: T) {
  // 取缓存
  const cacheData = await getCacheData()
  return name ? cacheData[name] : cacheData;
}

export const setCache = async (data: RozoneStorage) => {
  // 取缓存
  const cacheData = await getCacheData()
  // 更新缓存
  const newCacheData = { ...cacheData, ...data }
  storage.set(STORAGE_KEY, JSON.stringify(newCacheData))
}

export const getCurrentTabId = async (): Promise<chrome.tabs.Tab | undefined> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs.length ? tabs[0] : undefined)
    })
  })
}

export const sendMessageToContent = async (data: RozoneStorage) => {
  const currentTab = await getCurrentTabId()
  if (currentTab) {
    chrome.tabs.sendMessage(currentTab.id, JSON.stringify(data))
  }
}

export const isEmpty = (obj: Object) => !Object.keys(obj).length

export const isSelfExtension = (sender: chrome.runtime.MessageSender) => sender.id === (process.env.NODE_ENV === "development" ? DEV_EXTENSION_ID : EXTENSION_ID)
