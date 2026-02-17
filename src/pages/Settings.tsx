export default function Settings() {
  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">设置</h2>
      
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">关于应用</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Anki Learner 是一个基于 SRS (间隔重复系统) 的记忆辅助工具。
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">版本</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">v0.1.0</div>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-neutral-100 dark:border-neutral-700">
            <div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">作者</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">yerq</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-4 border-t border-neutral-100 dark:border-neutral-700">
            <div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">数据存储</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                数据存储在您的浏览器本地 (IndexedDB)。清除浏览器缓存可能会导致数据丢失。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
