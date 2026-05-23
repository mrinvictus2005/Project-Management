import { Tab } from "@headlessui/react"

function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
}

export default function Tabs({ tabs, setSelected, children }) {
    return (
        <div className="w-full px-1 sm:px-0">
            <Tab.Group>
                <Tab.List className="flex space-x-6 rounded-xl p-1 border-b border-gray-200 dark:border-slate-700">
                    {tabs.map((tab, index) => (
                        <Tab
                            key={tab.title}
                            onClick={() => setSelected(index)}
                            className={({ selected }) =>
                                classNames(
                                    "w-fit flex items-center outline-none gap-2 px-3 py-2.5 text-base font-medium leading-5 transition-all duration-200",

                                    selected
                                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                                        : "text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                )
                            }
                        >
                            {tab.icon}
                            <span>{tab.title}</span>
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="w-full mt-2">{children}</Tab.Panels>
            </Tab.Group>
        </div>
    )
}
