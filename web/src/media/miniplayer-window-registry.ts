const miniplayerViewsByGroupId = new Map<string, Window>()

export function registerMiniplayerView(groupId: string, view: Window) {
  miniplayerViewsByGroupId.set(groupId, view)
}

export function unregisterMiniplayerView(groupId: string) {
  miniplayerViewsByGroupId.delete(groupId)
}

export function findMiniplayerView(groupId: string): Window | undefined {
  const view = miniplayerViewsByGroupId.get(groupId)
  return view && !view.closed ? view : undefined
}

export function listOtherMiniplayerViews(groupId: string): Window[] {
  return [...miniplayerViewsByGroupId.entries()]
    .filter(([registeredGroupId, view]) => registeredGroupId !== groupId && !view.closed)
    .map(([, view]) => view)
}
