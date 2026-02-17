import { useState, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, initDB } from '../db'
import dayjs from 'dayjs'
import { Dialog, Transition } from '@headlessui/react'
import { PlusIcon, BookOpenIcon, Cog6ToothIcon, ArrowDownTrayIcon, RectangleStackIcon } from '@heroicons/react/24/outline'
import { dictionaries } from '../resources/dictionaries'
import { fetchAndImportDeck } from '../utils/dictionaryFetcher'
import AlertDialog from '../components/AlertDialog'

export default function Home() {
  const decks = useLiveQuery(() => db.decks.toArray())
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckDescription, setNewDeckDescription] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)
  
  // Dialog States
  const [alertInfo, setAlertInfo] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'info' 
  })

  // Load card counts for each deck
  const [counts, setCounts] = useState<Record<number, { new: number; due: number }>>({})

  useEffect(() => {
    initDB()
  }, [])

  useEffect(() => {
    async function loadCounts() {
      if (!decks) return
      const now = Date.now()
      const nextCounts: typeof counts = {}
      
      for (const deck of decks) {
        if (!deck.id) continue
        const newCards = await db.cards
          .where({ deckId: deck.id, state: 'new' })
          .count()
        
        const dueCards = await db.cards
          .where({ deckId: deck.id })
          .filter(c => c.state !== 'new' && c.due <= now)
          .count()
          
        nextCounts[deck.id] = { new: newCards, due: dueCards }
      }
      setCounts(nextCounts)
    }
    loadCounts()
  }, [decks])

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeckName.trim()) return
    await db.decks.add({
      name: newDeckName.trim(),
      description: newDeckDescription.trim(),
      created_at: Date.now(),
      autoShowAnswer: true,
      autoPlayAudio: true
    })
    setNewDeckName('')
    setNewDeckDescription('')
    setIsCreateOpen(false)
  }

  const handleImportDeck = async (dictId: string) => {
    const dict = dictionaries.find(d => d.id === dictId)
    if (!dict) return

    setImportingId(dictId)
    try {
      await fetchAndImportDeck(dict.url, dict.name, dict.description)
      setIsImportOpen(false)
      setAlertInfo({
        isOpen: true,
        title: '导入成功',
        message: `成功导入牌组：${dict.name}`,
        type: 'success'
      })
    } catch (error) {
      setAlertInfo({
        isOpen: true,
        title: '导入失败',
        message: '导入过程中出现错误，请重试',
        type: 'error'
      })
      console.error(error)
    } finally {
      setImportingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Dialogs */}
      <AlertDialog
        isOpen={alertInfo.isOpen}
        onClose={() => setAlertInfo(prev => ({ ...prev, isOpen: false }))}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">我的牌组</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">管理并复习你的记忆卡片</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsImportOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span className="whitespace-nowrap">导入预设</span>
          </button>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="whitespace-nowrap">新建牌组</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {decks?.map(deck => (
          <div key={deck.id} className="group relative">
            {/* Stack Effect Layers */}
            <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm translate-x-2 translate-y-2 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
            <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm translate-x-1 translate-y-1 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:translate-y-1.5" />
            
            {/* Main Card */}
            <div className="relative h-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 flex flex-col gap-6 transition-all duration-300 shadow-sm group-hover:-translate-y-1 group-hover:shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <RectangleStackIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Deck</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1" title={deck.name}>{deck.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                    Created {dayjs(deck.created_at).format('MMM D, YYYY')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg py-3 border border-neutral-100 dark:border-neutral-800 group-hover:border-blue-100 dark:group-hover:border-blue-900/30 transition-colors">
                  <div className="text-2xl font-bold text-green-500 dark:text-green-400">
                    {deck.id ? counts[deck.id]?.due || 0 : 0}
                  </div>
                  <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-0.5">待复习</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg py-3 border border-neutral-100 dark:border-neutral-800 group-hover:border-blue-100 dark:group-hover:border-blue-900/30 transition-colors">
                  <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
                    {deck.id ? counts[deck.id]?.new || 0 : 0}
                  </div>
                  <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-0.5">新卡片</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                <Link 
                  to={`/deck/${deck.id}`} 
                  className="flex items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-700/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-200 py-2.5 rounded-lg transition-colors font-medium border border-neutral-200 dark:border-neutral-600/30"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  管理
                </Link>
                <Link 
                  to={`/deck/${deck.id}/study`} 
                  className="flex items-center justify-center gap-2 bg-blue-600/90 hover:bg-blue-600 text-white py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20"
                >
                  <BookOpenIcon className="w-4 h-4" />
                  开始
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {decks?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/30">
            <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-full mb-4">
              <PlusIcon className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-300">还没有牌组</h3>
            <p className="text-neutral-500 mt-1">点击右上角创建你的第一个记忆牌组</p>
          </div>
        )}
      </div>

      {/* Import Deck Dialog */}
      <Transition appear show={isImportOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => !importingId && setIsImportOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 dark:bg-black/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 text-left align-middle shadow-2xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-neutral-900 dark:text-white flex items-center gap-2 mb-6"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 text-blue-500" />
                    导入预设牌组
                  </Dialog.Title>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {dictionaries.map(dict => (
                      <div 
                        key={dict.id}
                        className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-neutral-50 dark:bg-neutral-800/50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-neutral-900 dark:text-neutral-100">{dict.name}</h4>
                          <span className="text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-full">
                            {dict.length} 词
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 h-10 line-clamp-2">
                          {dict.description}
                        </p>
                        <button
                          onClick={() => handleImportDeck(dict.id)}
                          disabled={!!importingId}
                          className="w-full py-2 rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {importingId === dict.id ? '导入中...' : '下载并导入'}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none transition-colors"
                      onClick={() => setIsImportOpen(false)}
                      disabled={!!importingId}
                    >
                      关闭
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Create Deck Dialog */}
      <Transition appear show={isCreateOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsCreateOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 dark:bg-black/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 text-left align-middle shadow-2xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-neutral-900 dark:text-white flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5 text-blue-500" />
                    新建牌组
                  </Dialog.Title>
                  <form onSubmit={handleCreateDeck} className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">牌组名称</label>
                        <input
                          autoFocus
                          type="text"
                          className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 text-base"
                          value={newDeckName}
                          onChange={e => setNewDeckName(e.target.value)}
                          placeholder="例如：CET-4 核心词汇"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1">描述 (可选)</label>
                        <input
                          type="text"
                          className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 text-base"
                          value={newDeckDescription}
                          onChange={e => setNewDeckDescription(e.target.value)}
                          placeholder="关于这个牌组的简短描述..."
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex gap-3 justify-end">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 transition-colors"
                        onClick={() => setIsCreateOpen(false)}
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={!newDeckName.trim()}
                        className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        创建
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
