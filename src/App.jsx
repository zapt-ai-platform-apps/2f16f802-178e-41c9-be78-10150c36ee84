import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function App() {
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [loading, setLoading] = createSignal(false);
  const [workouts, setWorkouts] = createSignal([]);
  const [dietEntries, setDietEntries] = createSignal([]);
  const [newWorkout, setNewWorkout] = createSignal({ title: '', description: '', date: '' });
  const [newDietEntry, setNewDietEntry] = createSignal({ foodItem: '', calories: '', date: '' });

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const fetchWorkouts = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const response = await fetch('/api/getWorkouts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      } else {
        console.error('Error fetching workouts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async (e) => {
    e.preventDefault();
    if (loading()) return;

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const response = await fetch('/api/saveWorkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkout()),
      });
      if (response.ok) {
        const data = await response.json();
        setWorkouts([data, ...workouts()]);
        setNewWorkout({ title: '', description: '', date: '' });
      } else {
        console.error('Error saving workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDietEntries = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const response = await fetch('/api/getDietEntries', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDietEntries(data);
      } else {
        console.error('Error fetching diet entries:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching diet entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDietEntry = async (e) => {
    e.preventDefault();
    if (loading()) return;

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const response = await fetch('/api/saveDietEntry', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDietEntry()),
      });
      if (response.ok) {
        const data = await response.json();
        setDietEntries([data, ...dietEntries()]);
        setNewDietEntry({ foodItem: '', calories: '', date: '' });
      } else {
        console.error('Error saving diet entry');
      }
    } catch (error) {
      console.error('Error saving diet entry:', error);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    if (!user()) return;
    fetchWorkouts();
    fetchDietEntries();
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4 text-gray-800">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-green-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
              />
            </div>
          </div>
        }
      >
        <div class="max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold text-green-600">Workout Tracker</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-green-600">Add New Workout</h2>
              <form onSubmit={saveWorkout} class="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newWorkout().title}
                  onInput={(e) => setNewWorkout({ ...newWorkout(), title: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent box-border"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newWorkout().description}
                  onInput={(e) => setNewWorkout({ ...newWorkout(), description: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent box-border"
                />
                <input
                  type="date"
                  value={newWorkout().date}
                  onInput={(e) => setNewWorkout({ ...newWorkout(), date: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent box-border"
                />
                <button
                  type="submit"
                  class={`w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading()}
                >
                  <Show when={loading()}>Saving...</Show>
                  <Show when={!loading()}>Save Workout</Show>
                </button>
              </form>
            </div>

            <div class="col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-green-600">Add Diet Entry</h2>
              <form onSubmit={saveDietEntry} class="space-y-4">
                <input
                  type="text"
                  placeholder="Food Item"
                  value={newDietEntry().foodItem}
                  onInput={(e) => setNewDietEntry({ ...newDietEntry(), foodItem: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent box-border"
                  required
                />
                <input
                  type="number"
                  placeholder="Calories"
                  value={newDietEntry().calories}
                  onInput={(e) => setNewDietEntry({ ...newDietEntry(), calories: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent box-border"
                  required
                />
                <input
                  type="date"
                  value={newDietEntry().date}
                  onInput={(e) => setNewDietEntry({ ...newDietEntry(), date: e.target.value })}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent box-border"
                />
                <button
                  type="submit"
                  class={`w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading()}
                >
                  <Show when={loading()}>Saving...</Show>
                  <Show when={!loading()}>Save Diet Entry</Show>
                </button>
              </form>
            </div>

            <div class="col-span-1">
              <h2 class="text-2xl font-bold mb-4 text-green-600">Additional Features</h2>
              <div class="space-y-4">
                <button
                  onClick={() => setCurrentPage('routinePage')}
                  class="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                >
                  Manage Routines
                </button>
              </div>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-xl font-bold mb-2 text-green-600">Recent Workouts</h3>
              <div class="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-4">
                <Show when={!loading()} fallback={<p>Loading...</p>}>
                  <For each={workouts()}>
                    {(workout) => (
                      <div class="bg-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                        <p class="font-semibold text-lg text-green-600 mb-2">{workout.title}</p>
                        <p class="text-gray-700">{workout.description}</p>
                        <p class="text-sm text-gray-500 mt-2">Date: {new Date(workout.date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>
            <div>
              <h3 class="text-xl font-bold mb-2 text-green-600">Recent Diet Entries</h3>
              <div class="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-4">
                <Show when={!loading()} fallback={<p>Loading...</p>}>
                  <For each={dietEntries()}>
                    {(entry) => (
                      <div class="bg-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                        <p class="font-semibold text-lg text-blue-600 mb-2">{entry.foodItem}</p>
                        <p class="text-gray-700">Calories: {entry.calories}</p>
                        <p class="text-sm text-gray-500 mt-2">Date: {new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default App;