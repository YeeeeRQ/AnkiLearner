import { useState, useEffect, Fragment } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import dayjs from 'dayjs'
import { Tab, Switch, Dialog, Transition } from '@headlessui/react'
import { ArrowLeftIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, RectangleStackIcon, PlusIcon, Cog6ToothIcon, ListBulletIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import cls from 'classnames'
import ConfirmDialog from '../components/ConfirmDialog'

export default function DeckDetail() {
  const { id } = useParams()
  const deckId = parseInt(id || '0')
  const navigate = useNavigate()
  
  const deck = useLiveQuery(() => db.decks.get(deckId))
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const totalCards = useLiveQuery(() => db.cards.where({ deckId }).count()) || 0
  const cards = useLiveQuery(() => 
    db.cards
      .where({ deckId })
      .offset((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray()
  , [deckId, page])

  const totalPages = Math.ceil(totalCards / PAGE_SIZE)

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages)
    }
  }, [totalPages, page])

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [note, setNote] = useState('')
  const [editingCardId, setEditingCardId] = useState<number | null>(null)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [deleteCardId, setDeleteCardId] = useState<number | null>(null)
  const [isDeleteDeckOpen, setIsDeleteDeckOpen] = useState(false)

  useEffect(() => {
    if (isNaN(deckId)) navigate('/')
  }, [deckId, navigate])

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return

    if (editingCardId) {
      await db.cards.update(editingCardId, {
        front, back, note
      })
      setEditingCardId(null)
    } else {
      await db.cards.add({
        deckId,
        front,
        back,
        note,
        state: 'new',
        step: 0,
        due: 0,
        interval: 0,
        ease: 2.5,
        reps: 0,
        lapses: 0,
        created_at: Date.now(),
        last_review: 0
      })
    }
    setFront('')
    setBack('')
    setNote('')
    setIsCardModalOpen(false)
  }

  const handleEdit = (card: any) => {
    setFront(card.front)
    setBack(card.back)
    setNote(card.note || '')
    setEditingCardId(card.id)
    setIsCardModalOpen(true)
  }

  const handleAdd = () => {
    setFront('')
    setBack('')
    setNote('')
    setEditingCardId(null)
    setIsCardModalOpen(true)
  }

  const handleDelete = (cardId: number) => {
    setDeleteCardId(cardId)
  }

  const confirmDeleteCard = async () => {
    if (!deleteCardId) return
    await db.cards.delete(deleteCardId)
    setDeleteCardId(null)
  }

  const handleDeleteDeck = async () => {
    await db.transaction('rw', db.decks, db.cards, async () => {
      await db.cards.where({ deckId }).delete()
      await db.decks.delete(deckId)
    })
    navigate('/')
  }

  const cancelEdit = () => {
    setEditingCardId(null)
    setFront('')
    setBack('')
    setNote('')
    setIsCardModalOpen(false)
  }

  const toggleAutoShowAnswer = async () => {
    if (!deck) return
    await db.decks.update(deckId, { autoShowAnswer: !deck.autoShowAnswer })
  }

  const toggleAutoPlayAudio = async () => {
    if (!deck) return
    await db.decks.update(deckId, { autoPlayAudio: !deck.autoPlayAudio })
  }


  if (!deck) return <div className="text-center p-8 text-neutral-500">Loading...</div>

  return (
    <div className="space-y-6 w-full">
      <ConfirmDialog
        isOpen={!!deleteCardId}
        onClose={() => setDeleteCardId(null)}
        onConfirm={confirmDeleteCard}
        title="删除卡片"
        message="确定要删除这张卡片吗？此操作无法撤销。"
        confirmText="删除"
        type="danger"
      />

      <ConfirmDialog
        isOpen={isDeleteDeckOpen}
        onClose={() => setIsDeleteDeckOpen(false)}
        onConfirm={handleDeleteDeck}
        title="删除牌组"
        message="确定删除该牌组及其所有卡片吗？此操作无法撤销。"
        confirmText="删除"
        type="danger"
      />
      
      {/* Card Editor Modal */}
      <Transition appear show={isCardModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cancelEdit}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-neutral-900 dark:text-white flex items-center justify-between mb-6"
                  >
                    <span>{editingCardId ? '编辑卡片' : '添加卡片'}</span>
                    <button
                      onClick={cancelEdit}
                      className="text-neutral-400 hover:text-neutral-500 focus:outline-none"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </Dialog.Title>
                  
                  <form onSubmit={handleSaveCard} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400">正面 (问题)</label>
                        <textarea
                          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 h-40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-base"
                          value={front}
                          onChange={e => setFront(e.target.value)}
                          placeholder="输入问题..."
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400">背面 (答案)</label>
                        <textarea
                          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 h-40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-base"
                          value={back}
                          onChange={e => setBack(e.target.value)}
                          placeholder="输入答案..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400">备注 (可选)</label>
                      <input
                        type="text"
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 text-base"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="助记词、图片链接等..."
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <button 
                        type="button" 
                        onClick={cancelEdit}
                        className="px-6 py-2.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
                      >
                        取消
                      </button>
                      <button 
                        type="submit" 
                        disabled={!front.trim() || !back.trim()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg transition-all font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20"
                      >
                        <CheckIcon className="w-5 h-5" />
                        {editingCardId ? '保存修改' : '添加卡片'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="flex items-start gap-4">
          <Link 
            to="/" 
            className="mt-1 p-2 -ml-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white break-all">
              {deck.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1.5">
                <RectangleStackIcon className="w-4 h-4" />
                <span>{totalCards} 张卡片</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDaysIcon className="w-4 h-4" />
                <span>创建于 {dayjs(deck.created_at).format('YYYY-MM-DD')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleAdd}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          <span>添加卡片</span>
        </button>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              cls(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors flex items-center justify-center gap-2',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-white shadow'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-white'
              )
            }
          >
            <ListBulletIcon className="w-5 h-5" />
            卡片列表 ({totalCards})
          </Tab>
          <Tab
            className={({ selected }) =>
              cls(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors flex items-center justify-center gap-2',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-white shadow'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-white'
              )
            }
          >
            <Cog6ToothIcon className="w-5 h-5" />
            功能设置
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* List Panel */}
          <Tab.Panel
            className={cls(
              'space-y-4 outline-none'
            )}
          >
            {cards?.map(card => (
              <div key={card.id} className="group bg-white dark:bg-neutral-800/30 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 p-5 rounded-xl transition-all duration-200 flex flex-col md:flex-row gap-5 shadow-sm hover:shadow-md">
                <div className="flex-1 min-w-0 grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider mb-1">Front</div>
                    <div className="text-neutral-900 dark:text-neutral-200 whitespace-pre-wrap break-words">{card.front}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 dark:text-neutral-500 font-medium uppercase tracking-wider mb-1">Back</div>
                    <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap break-words">{card.back}</div>
                    {card.note && (
                      <div className="mt-2 text-sm text-neutral-500 bg-neutral-100 dark:bg-neutral-900/50 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800/50 inline-block">
                        📝 {card.note}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex md:flex-col justify-between items-end gap-4 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800 pt-4 md:pt-0 md:pl-5 min-w-[120px]">
                  <div className="flex flex-col items-end gap-1">
                    <span className={cls(
                      'px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider',
                      {
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50': card.state === 'new',
                        'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50': ['learning', 'relearning'].includes(card.state),
                        'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50': card.state === 'review'
                      }
                    )}>
                      {card.state}
                    </span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-600 font-mono">
                      {card.due > 0 ? dayjs(card.due).format('MM/DD HH:mm') : 'Not scheduled'}
                    </span>
                  </div>

                  <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(card)} 
                      className="p-2 text-neutral-400 hover:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => card.id && handleDelete(card.id)} 
                      className="p-2 text-neutral-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="删除"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cards?.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/30">
                <p className="text-neutral-500">该牌组还没有卡片，去添加一些吧！</p>
              </div>
            )}

            {/* Pagination */}
            {totalCards > 0 && (
              <div className="flex items-center justify-between mt-6 px-2 py-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  显示 {(page - 1) * PAGE_SIZE + 1} 到 {Math.min(page * PAGE_SIZE, totalCards)} 条，共 {totalCards} 条
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 px-2">
                    {page} / {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </button>
                </div>
              </div>
            )}
          </Tab.Panel>

          {/* Settings Panel */}
          <Tab.Panel
            className={cls(
              'space-y-6 bg-white dark:bg-neutral-800/30 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800',
              'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
            )}
          >
            <div className="space-y-6 max-w-lg">
              <Switch.Group>
                <div className="flex items-center justify-between">
                  <Switch.Label className="flex flex-col cursor-pointer select-none">
                    <span className="text-base font-medium text-neutral-900 dark:text-white">自动展示答案</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">练习时无需手动翻转卡片</span>
                  </Switch.Label>
                  <Switch
                    checked={!!deck.autoShowAnswer}
                    onChange={toggleAutoShowAnswer}
                    className={`${
                      deck.autoShowAnswer ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900`}
                  >
                    <span
                      className={`${
                        deck.autoShowAnswer ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </Switch.Group>

              <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

              <Switch.Group>
                <div className="flex items-center justify-between">
                  <Switch.Label className="flex flex-col cursor-pointer select-none">
                    <span className="text-base font-medium text-neutral-900 dark:text-white">自动播放音频</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">显示卡片时自动朗读正面内容</span>
                  </Switch.Label>
                  <Switch
                    checked={!!deck.autoPlayAudio}
                    onChange={toggleAutoPlayAudio}
                    className={`${
                      deck.autoPlayAudio ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900`}
                  >
                    <span
                      className={`${
                        deck.autoPlayAudio ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </Switch.Group>



              <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

              <div className="pt-2">
                <button
                  onClick={() => setIsDeleteDeckOpen(true)}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium"
                >
                  <TrashIcon className="w-5 h-5" />
                  删除牌组
                </button>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  删除牌组将永久删除该牌组下的所有卡片，此操作无法撤销。
                </p>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
