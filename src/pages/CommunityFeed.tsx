import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Flame, Activity, Award, Target, MoreHorizontal } from 'lucide-react';

interface Post {
  id: string;
  user: { name: string; avatar: string };
  content: string;
  image_url: string | null;
  likes_count: number;
  created_at: string;
}

interface Story {
  id: string;
  name: string;
  avatar: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  participants: number;
}

export default function CommunityFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be a fetch to /api/v1/community/feed
    // Since backend might not be running locally for the user right now, we can use the same fallback data 
    // or fetch it if available. Let's fetch it from our new endpoint!
    const apiUrl = `http://${window.location.hostname}:8000/api/v1/community/feed`;
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setStories(data.stories || []);
        setChallenges(data.challenges || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch feed, using fallback data", err);
        // Fallback mock data if backend isn't up
        setPosts([
          {
            id: "1",
            user: { name: "Soumyajit Bhowmik", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Soumya" },
            content: "Fitness Journey • 9/18/2026\nJust crushed my leg day! The new AI posture coach really helped with my squat depth.",
            image_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
            likes_count: 24,
            created_at: "2026-09-18T10:00:00Z"
          },
          {
            id: "2",
            user: { name: "Ayan Mondal", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayan" },
            content: "Consistency is key. 5k morning run complete. #Endurance",
            image_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop",
            likes_count: 15,
            created_at: "2026-09-19T08:30:00Z"
          }
        ]);
        setStories([
          { id: "s1", name: "Ayan Mondal", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayan" },
          { id: "s2", name: "Sachin Kumar", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sachin" },
          { id: "s3", name: "Saikat Gorai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saikat" },
          { id: "s4", name: "Soumya", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Soumya" }
        ]);
        setChallenges([
          { id: "c1", title: "30 Day Fitness Challenge", description: "Community Challenge", icon: "target", participants: 1204 },
          { id: "c2", title: "5KM Running Challenge", description: "Endurance Goal", icon: "activity", participants: 842 },
          { id: "c3", title: "7 Day Streak Challenge", description: "Consistency Goal", icon: "award", participants: 2341 }
        ]);
        setIsLoading(false);
      });
  }, []);

  const renderIcon = (iconName: string) => {
    switch(iconName) {
      case 'target': return <Target className="w-6 h-6 text-orange-500" />;
      case 'activity': return <Activity className="w-6 h-6 text-blue-500" />;
      case 'award': return <Award className="w-6 h-6 text-purple-500" />;
      default: return <Flame className="w-6 h-6 text-orange-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in flex flex-col lg:flex-row gap-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        
        {/* Stories Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900">Stories</h2>
          <p className="text-slate-500 text-sm mb-6">Recent fitness highlights</p>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {/* Current User Story */}
            <div className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-orange-400">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                    <img src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'} alt="You" className="w-full h-full object-cover" />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
                  <Plus className="w-3 h-3 font-bold" />
                </button>
              </div>
              <span className="text-xs text-slate-600 font-medium">Your Story</span>
            </div>

            {/* Other Users Stories */}
            {stories.map(story => (
              <div key={story.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-orange-400 to-yellow-400">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-slate-100">
                    <img src={story.avatar} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-xs text-slate-600 font-medium truncate w-full text-center">{story.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Create Post Input */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <img src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'} alt="You" className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
          <input 
            type="text" 
            placeholder="Share your fitness journey or workout win today..." 
            className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Latest Feed */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Latest from the Community</h2>
          
          {isLoading ? (
            <div className="animate-pulse space-y-8">
              {[1,2].map(i => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm h-64 border border-slate-100"></div>
              ))}
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full bg-slate-100" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm uppercase">{post.user.name}</h3>
                      <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                
                {post.image_url && (
                  <div className="w-full aspect-video bg-slate-100 relative">
                    <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Right Sidebar - Trending Challenges */}
      <div className="lg:w-80 shrink-0">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-8">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-slate-900">Trending Challenges</h2>
          </div>
          
          <div className="space-y-4">
            {challenges.map(challenge => (
              <div key={challenge.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    challenge.icon === 'target' ? 'bg-orange-100' : 
                    challenge.icon === 'activity' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {renderIcon(challenge.icon)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{challenge.title}</h3>
                    <p className="text-xs text-slate-500">{challenge.description}</p>
                  </div>
                </div>
                <button className="text-slate-400 group-hover:text-blue-500">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
