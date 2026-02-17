import { useAtom } from 'jotai'
import { pronunciationConfigAtom, soundEffectVolumeAtom } from '../state'
import Select from '../components/Select'

export default function Settings() {
  const [pronunciationConfig, setPronunciationConfig] = useAtom(pronunciationConfigAtom)
  const [soundEffectVolume, setSoundEffectVolume] = useAtom(soundEffectVolumeAtom)

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">设置</h2>
      
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden mb-6">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">声音设置</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">发音类型</label>
            <Select
              value={pronunciationConfig.type}
              onChange={(value) => setPronunciationConfig({ ...pronunciationConfig, type: value as any })}
              options={[
                { value: 'us', label: '美式 (US)' },
                { value: 'uk', label: '英式 (UK)' }
              ]}
              className="ml-4 w-40"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">发音音量</label>
            <div className="flex items-center gap-4 w-40">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={pronunciationConfig.volume}
                onChange={(e) => setPronunciationConfig({ ...pronunciationConfig, volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-blue-600"
              />
              <span className="text-sm w-8 text-right text-neutral-500">{Math.round(pronunciationConfig.volume * 100)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">音效音量</label>
            <div className="flex items-center gap-4 w-40">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={soundEffectVolume}
                onChange={(e) => setSoundEffectVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 accent-blue-600"
              />
              <span className="text-sm w-8 text-right text-neutral-500">{Math.round(soundEffectVolume * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

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
              <div className="text-sm text-neutral-500 dark:text-neutral-400">v{__APP_VERSION__}</div>
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
              <div className="font-medium text-neutral-900 dark:text-neutral-100">联系邮箱</div>
              <a href="mailto:yeeeerq@outlook.com" className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                yeeeerq@outlook.com
              </a>
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
