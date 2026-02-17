import { NavLink, Outlet, useLocation } from 'react-router-dom'
import cls from 'classnames'
import { useAtom } from 'jotai'
import { themeAtom } from '../state'
import { useEffect } from 'react'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function AppLayout() {
  const [theme, setTheme] = useAtom(themeAtom)
  const location = useLocation()
  const isStudyPage = location.pathname.includes('/study')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const applySystemTheme = () => {
        root.classList.remove('light', 'dark')
        root.classList.add(mediaQuery.matches ? 'dark' : 'light')
      }

      applySystemTheme()
      mediaQuery.addEventListener('change', applySystemTheme)
      return () => mediaQuery.removeEventListener('change', applySystemTheme)
    }

    root.classList.add(theme)
  }, [theme])

  const linkBase =
    'px-2 sm:px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm sm:text-base'
  
  return (
    <div className={cls(
      "min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 overflow-x-hidden",
      isStudyPage && "h-screen overflow-hidden"
    )}>
      {!isStudyPage && (
      <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
            Anki Learner
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex gap-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cls(linkBase, isActive && 'bg-neutral-100 dark:bg-neutral-800 font-medium')
                }
              >
                牌组
              </NavLink>

              <NavLink
                to="/stats"
                className={({ isActive }) =>
                  cls(linkBase, isActive && 'bg-neutral-100 dark:bg-neutral-800 font-medium')
                }
              >
                统计
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cls(linkBase, isActive && 'bg-neutral-100 dark:bg-neutral-800 font-medium')
                }
              >
                设置
              </NavLink>
            </nav>

            {/* Theme Toggle */}
            <Menu as="div" className="relative ml-2">
              <Menu.Button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500 dark:text-neutral-400">
                {theme === 'light' ? (
                  <SunIcon className="w-5 h-5" />
                ) : theme === 'dark' ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <ComputerDesktopIcon className="w-5 h-5" />
                )}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-neutral-200 dark:border-neutral-700">
                  <div className="p-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setTheme('light')}
                          className={cls(
                            'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm',
                            active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300',
                            theme === 'light' && 'text-blue-600 dark:text-blue-400 font-medium'
                          )}
                        >
                          <SunIcon className="w-4 h-4" />
                          浅色
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setTheme('dark')}
                          className={cls(
                            'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm',
                            active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300',
                            theme === 'dark' && 'text-blue-600 dark:text-blue-400 font-medium'
                          )}
                        >
                          <MoonIcon className="w-4 h-4" />
                          深色
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setTheme('system')}
                          className={cls(
                            'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm',
                            active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300',
                            theme === 'system' && 'text-blue-600 dark:text-blue-400 font-medium'
                          )}
                        >
                          <ComputerDesktopIcon className="w-4 h-4" />
                          系统
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </header>
      )}
      <main className={cls('w-full max-w-7xl mx-auto flex-1', !isStudyPage && 'px-4 py-8')}>
        <Outlet />
      </main>

      {!isStudyPage && (
        <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Designed & Developed by <span className="font-medium text-neutral-900 dark:text-neutral-200">yerq</span>
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
