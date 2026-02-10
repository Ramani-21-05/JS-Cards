import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PencilIcon, TrashIcon, PlusIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppStore } from '../store/useAppStore';
import { getAllKanji, updateKanji, addKanji, deleteKanji, getProgress } from '../utils/storage';

function Admin() {
  const { isAdminLoggedIn, loginAdmin, logoutAdmin, currentUser } = useAppStore();
  const [password, setPassword] = useState('');
  const [kanjiList, setKanjiList] = useState([]);
  const [sortBy, setSortBy] = useState('kanji');
  const [editModal, setEditModal] = useState({ open: false, kanji: null });
  const [addModal, setAddModal] = useState(false);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadKanji();
    }
  }, [isAdminLoggedIn]);

  const loadKanji = async () => {
    const kanji = await getAllKanji();
    const userEmail = currentUser?.email || 'guest';
    const withProgress = await Promise.all(
      kanji.map(async (k) => {
        const progress = await getProgress(k.kanji, userEmail);
        return { ...k, mastery: progress?.mastery || 'new' };
      })
    );
    setKanjiList(withProgress);
  };

  const sortedKanji = [...kanjiList].sort((a, b) => {
    if (sortBy === 'kanji') return a.kanji.localeCompare(b.kanji);
    if (sortBy === 'mastery') return (a.mastery || '').localeCompare(b.mastery || '');
    return 0;
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      setPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setEditModal({ open: false, kanji: null });
    setAddModal(false);
  };

  const handleEdit = (kanji) => {
    setFormData({
      ...kanji,
      onyomi: kanji.onyomi?.join(', ') || '',
      kunyomi: kanji.kunyomi?.join(', ') || '',
      examples: kanji.examples?.map(ex => `${ex.japanese}|${ex.reading}|${ex.english}`).join('\n') || ''
    });
    setEditModal({ open: true, kanji });
  };

  const handleAdd = () => {
    setFormData({ kanji: '', meaning: '', onyomi: '', kunyomi: '', examples: '' });
    setAddModal(true);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleUpdate = async () => {
    const updated = {
      ...editModal.kanji,
      meaning: formData.meaning,
      onyomi: formData.onyomi.split(',').map(s => s.trim()).filter(Boolean),
      kunyomi: formData.kunyomi.split(',').map(s => s.trim()).filter(Boolean),
      examples: formData.examples.split('\n').filter(Boolean).map(line => {
        const [japanese, reading, english] = line.split('|').map(s => s.trim());
        return { japanese, reading, english };
      })
    };
    await updateKanji(updated);
    setEditModal({ open: false, kanji: null });
    loadKanji();
  };

  const handleCreate = async () => {
    if (!formData.kanji) {
      alert('Kanji character is required');
      return;
    }
    const newKanji = {
      kanji: formData.kanji,
      meaning: formData.meaning,
      onyomi: formData.onyomi.split(',').map(s => s.trim()).filter(Boolean),
      kunyomi: formData.kunyomi.split(',').map(s => s.trim()).filter(Boolean),
      examples: formData.examples.split('\n').filter(Boolean).map(line => {
        const [japanese, reading, english] = line.split('|').map(s => s.trim());
        return { japanese, reading, english };
      })
    };
    try {
      await addKanji(newKanji);
      setAddModal(false);
      loadKanji();
    } catch (error) {
      alert('Error adding kanji. It may already exist.');
    }
  };

  const handleBulkImport = async () => {
    try {
      const data = JSON.parse(bulkJson);
      const kanjiArray = Array.isArray(data) ? data : [data];
      for (const k of kanjiArray) {
        try {
          await addKanji(k);
        } catch (e) {
          console.error(`Failed to add ${k.kanji}:`, e);
        }
      }
      setBulkModal(false);
      setBulkJson('');
      loadKanji();
      alert(`Imported ${kanjiArray.length} kanji`);
    } catch (error) {
      alert('Invalid JSON format');
    }
  };

  const handleDelete = async (kanjiChar) => {
    if (confirm(`Delete ${kanjiChar}?`)) {
      await deleteKanji(kanjiChar);
      loadKanji();
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">Admin Login</h2>
        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded mb-4"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Admin Panel</h2>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded transition flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Add
          </button>
          <button
            onClick={() => setBulkModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded transition flex items-center gap-2"
          >
            <ArrowUpTrayIcon className="w-5 h-5" /> Bulk Import
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSortBy('kanji')}
          className={`px-4 py-2 rounded transition ${
            sortBy === 'kanji' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
          }`}
        >
          Sort by Kanji
        </button>
        <button
          onClick={() => setSortBy('mastery')}
          className={`px-4 py-2 rounded transition ${
            sortBy === 'mastery' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
          }`}
        >
          Sort by Mastery
        </button>
      </div>

      {/* Kanji Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kanji</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Meaning</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Readings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mastery</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedKanji.map((kanji) => (
              <tr key={kanji.kanji} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-3xl font-bold dark:text-white">{kanji.kanji}</td>
                <td className="px-6 py-4 dark:text-gray-300">{kanji.meaning}</td>
                <td className="px-6 py-4 text-sm dark:text-gray-300">
                  <div>On: {kanji.onyomi?.join(', ') || 'N/A'}</div>
                  <div>Kun: {kanji.kunyomi?.join(', ') || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    kanji.mastery === 'known' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    kanji.mastery === 'learning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {kanji.mastery || 'new'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleEdit(kanji)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3"
                  >
                    <PencilIcon className="w-5 h-5 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(kanji.kanji)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400"
                  >
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Transition appear show={editModal.open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setEditModal({ open: false, kanji: null })}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-bold dark:text-white mb-4 flex justify-between items-center">
                    Edit Kanji
                    <button onClick={() => setEditModal({ open: false, kanji: null })}>
                      <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-gray-300 mb-1">Kanji</label>
                      <input
                        type="text"
                        value={editModal.kanji?.kanji || ''}
                        disabled
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-gray-300 mb-1">Meaning</label>
                      <input
                        type="text"
                        value={formData.meaning || ''}
                        onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-gray-300 mb-1">On'yomi (comma-separated)</label>
                      <input
                        type="text"
                        value={formData.onyomi || ''}
                        onChange={(e) => setFormData({ ...formData, onyomi: e.target.value })}
                        placeholder="ニチ, ジツ"
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-gray-300 mb-1">Kun'yomi (comma-separated)</label>
                      <input
                        type="text"
                        value={formData.kunyomi || ''}
                        onChange={(e) => setFormData({ ...formData, kunyomi: e.target.value })}
                        placeholder="ひ, か"
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-gray-300 mb-1">Examples (one per line: japanese|reading|english)</label>
                      <textarea
                        value={formData.examples || ''}
                        onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                        placeholder="日本|にほん|Japan"
                        rows={4}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleUpdate}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setEditModal({ open: false, kanji: null })}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded transition"
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Add Modal */}
      <Transition appear show={addModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setAddModal(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-bold dark:text-white mb-4">Add New Kanji</Dialog.Title>
                  <div className="space-y-4">
                    <input type="text" placeholder="Kanji character" value={formData.kanji || ''} onChange={(e) => setFormData({ ...formData, kanji: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                    <input type="text" placeholder="Meaning" value={formData.meaning || ''} onChange={(e) => setFormData({ ...formData, meaning: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                    <input type="text" placeholder="On'yomi (comma-separated)" value={formData.onyomi || ''} onChange={(e) => setFormData({ ...formData, onyomi: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                    <input type="text" placeholder="Kun'yomi (comma-separated)" value={formData.kunyomi || ''} onChange={(e) => setFormData({ ...formData, kunyomi: e.target.value })} className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                    <textarea placeholder="Examples (one per line: japanese|reading|english)" value={formData.examples || ''} onChange={(e) => setFormData({ ...formData, examples: e.target.value })} rows={4} className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={handleCreate} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition">Add</button>
                    <button onClick={() => setAddModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded transition">Cancel</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Bulk Import Modal */}
      <Transition appear show={bulkModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setBulkModal(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-bold dark:text-white mb-4">Bulk Import Kanji (JSON)</Dialog.Title>
                  <textarea value={bulkJson} onChange={(e) => setBulkJson(e.target.value)} placeholder='[{"kanji":"日","meaning":"sun","onyomi":["ニチ"],"kunyomi":["ひ"],"examples":[{"japanese":"日本","reading":"にほん","english":"Japan"}]}]' rows={12} className="w-full px-3 py-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white font-mono text-sm" />
                  <div className="mt-6 flex gap-3">
                    <button onClick={handleBulkImport} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition">Import</button>
                    <button onClick={() => setBulkModal(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded transition">Cancel</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default Admin;
