import { Storage } from "@plasmohq/storage";
import type { Rule } from "~devtools/panels";

const storage = new Storage()

const getCacheData = async (): Promise<Rule[]> => {
  const cacheJSON = await storage.get("rozone_rules")
  return cacheJSON ? JSON.parse(cacheJSON) : {}
}

export function getCache<T extends keyof Rule[]>(name: T): Promise<Rule[][T]>;
export function getCache(): Promise<Rule[]>;
export async function getCache<T extends keyof Rule[]>(name?: T) {
  // 取缓存
  const cacheData = await getCacheData()
  return name ? cacheData[name] : cacheData;
}

export const setCache = async (data: Rule[]) => {
  // 取缓存
  const cacheData = await getCacheData()
  // 更新缓存
  const newCacheData = { ...cacheData, ...data }
  storage.set("rozone_rules", JSON.stringify(newCacheData))
}

export const getCurrentTabId = async (): Promise<chrome.tabs.Tab | undefined> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs.length ? tabs[0] : undefined)
    })
  })
}

export const sendMessageToContent = async (data: Rule[]) => {
  const currentTab = await getCurrentTabId()
  if (currentTab) {
    chrome.tabs.sendMessage(currentTab.id, JSON.stringify(data))
  }
}
