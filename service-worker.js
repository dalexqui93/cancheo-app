const CACHE_NAME = 'cancheo-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',

  // App structure
  '/App.tsx',
  '/src/App.tsx',
  '/types.ts',
  '/database.ts',
  '/firebase.ts',

  // Hooks
  '/hooks/useMockData.ts',
  
  // Utils
  '/utils/geolocation.ts',
  '/utils/timeSince.ts',
  '/utils/weatherUtils.ts',

  // Components
  '/components/Accordion.tsx',
  '/components/BottomNav.tsx',
  '/components/ConfirmationModal.tsx',
  '/components/FieldCard.tsx',
  '/components/FieldCardSkeleton.tsx',
  '/components/Header.tsx',
  '/components/ImageLightbox.tsx',
  '/components/LogoGalleryModal.tsx',
  '/components/LoyaltyStatus.tsx',
  '/components/NotificationContainer.tsx',
  '/components/NotificationToast.tsx',
  '/components/PremiumBadge.tsx',
  '/components/PremiumLockModal.tsx',
  '/components/RatingModal.tsx',
  '/components/RewardAnimation.tsx',
  '/components/ReviewsModal.tsx',
  '/components/ScorekeeperModal.tsx',
  '/components/ScrollOnOverflow.tsx',
  '/components/StarRating.tsx',
  '/components/ToggleSwitch.tsx',
  '/components/forum/CreatePost.tsx',
  '/components/forum/EditPostModal.tsx',
  '/components/player_profile/AvatarDisplay.tsx',
  '/components/player_profile/StatSlider.tsx',
  '/components/team/ChatMessageBubble.tsx',
  '/components/team/FormationPitch.tsx',
  '/components/team/MessageInput.tsx',
  '/components/weather/AnimatedWeatherBackground.tsx',
  '/components/weather/BookingWeatherStatus.tsx',
  '/components/weather/CompactWeatherWidget.tsx',
  '/components/weather/WeatherTimeline.tsx',
  
  // Icons
  '/components/icons/AngryIcon.tsx',
  '/components/icons/ArrowUturnLeftIcon.tsx',
  '/components/icons/BanIcon.tsx',
  '/components/icons/BatteryIcon.tsx',
  '/components/icons/BellIcon.tsx',
  '/components/icons/BellSlashIcon.tsx',
  '/components/icons/BookingPassIcon.tsx',
  '/components/icons/CalendarDaysIcon.tsx',
  '/components/icons/CalendarIcon.tsx',
  '/components/icons/CameraIcon.tsx',
  '/components/icons/CardBrandIcon.tsx',
  '/components/icons/CashIcon.tsx',
  '/components/icons/ChartBarIcon.tsx',
  '/components/icons/ChatBubbleBottomCenterTextIcon.tsx',
  '/components/icons/ChatBubbleLeftRightIcon.tsx',
  '/components/icons/ChatBubbleOvalLeftIcon.tsx',
  '/components/icons/CheckBadgeIcon.tsx',
  '/components/icons/CheckCircleIcon.tsx',
  '/components/icons/CheckIcon.tsx',
  '/components/icons/ChevronDownIcon.tsx',
  '/components/icons/ChevronLeftIcon.tsx',
  '/components/icons/ChevronRightIcon.tsx',
  '/components/icons/ChevronUpIcon.tsx',
  '/components/icons/ClipboardListIcon.tsx',
  '/components/icons/ClockIcon.tsx',
  '/components/icons/CogIcon.tsx',
  '/components/icons/CommunityShieldIcon.tsx',
  '/components/icons/CompassIcon.tsx',
  '/components/icons/CreditCardIcon.tsx',
  '/components/icons/CurrencyDollarIcon.tsx',
  '/components/icons/DashboardIcon.tsx',
  '/components/icons/DaviplataIcon.tsx',
  '/components/icons/DesktopIcon.tsx',
  '/components/icons/DotsHorizontalIcon.tsx',
  '/components/icons/DotsVerticalIcon.tsx',
  '/components/icons/DoubleCheckIcon.tsx',
  '/components/icons/DumbbellIcon.tsx',
  '/components/icons/ExclamationTriangleIcon.tsx',
  '/components/icons/EyeIcon.tsx',
  '/components/icons/EyeOffIcon.tsx',
  '/components/icons/FaceSmileIcon.tsx',
  '/components/icons/FilterIcon.tsx',
  '/components/icons/FireIcon.tsx',
  '/components/icons/ForumIcon.tsx',
  '/components/icons/GoogleIcon.tsx',
  '/components/icons/HeartIcon.tsx',
  '/components/icons/HelpIcon.tsx',
  '/components/icons/IdentificationIcon.tsx',
  '/components/icons/ImageIcon.tsx',
  '/components/icons/InformationCircleIcon.tsx',
  '/components/icons/LaughingIcon.tsx',
  '/components/icons/LikeIcon.tsx',
  '/components/icons/ListBulletIcon.tsx',
  '/components/icons/ListIcon.tsx',
  '/components/icons/LocationIcon.tsx',
  '/components/icons/LockIcon.tsx',
  '/components/icons/LogoutIcon.tsx',
  '/components/icons/MailIcon.tsx',
  '/components/icons/MapIcon.tsx',
  '/components/icons/MapPinIcon.tsx',
  '/components/icons/MedalIcon.tsx',
  '/components/icons/MegaphoneIcon.tsx',
  '/components/icons/MicrophoneIcon.tsx',
  '/components/icons/MinusIcon.tsx',
  '/components/icons/MoonIcon.tsx',
  '/components/icons/NequiIcon.tsx',
  '/components/icons/PaintBrushIcon.tsx',
  '/components/icons/PaperAirplaneIcon.tsx',
  '/components/icons/PaperclipIcon.tsx',
  '/components/icons/PencilIcon.tsx',
  '/components/icons/PersonIcon.tsx',
  '/components/icons/PhoneIcon.tsx',
  '/components/icons/PinIcon.tsx',
  '/components/icons/PitchIcon.tsx',
  '/components/icons/PlayerCardIcon.tsx',
  '/components/icons/PlayerJerseyIcon.tsx',
  '/components/icons/PlayerKickingBallIcon.tsx',
  '/components/icons/PlusCircleIcon.tsx',
  '/components/icons/PlusIcon.tsx',
  '/components/icons/PseIcon.tsx',
  '/components/icons/RainDropIcon.tsx',
  '/components/icons/RedCardIcon.tsx',
  '/components/icons/RefereeWhistleIcon.tsx',
  '/components/icons/RulerIcon.tsx',
  '/components/icons/RunningIcon.tsx',
  '/components/icons/ScoreboardIcon.tsx',
  '/components/icons/SearchIcon.tsx',
  '/components/icons/ShieldIcon.tsx',
  '/components/icons/ShoeIcon.tsx',
  '/components/icons/SoccerBallIcon.tsx',
  '/components/icons/SoccerPlayerIcon.tsx',
  '/components/icons/SparklesIcon.tsx',
  '/components/icons/SpinnerIcon.tsx',
  '/components/icons/StarIcon.tsx',
  '/components/icons/StrategyIcon.tsx',
  '/components/icons/SunIcon.tsx',
  '/components/icons/SwordsIcon.tsx',
  '/components/icons/TacticBoardElevenIcon.tsx',
  '/components/icons/TacticBoardFiveIcon.tsx',
  '/components/icons/TacticBoardSevenIcon.tsx',
  '/components/icons/TagIcon.tsx',
  '/components/icons/TeamFormIcon.tsx',
  '/components/icons/TicketIcon.tsx',
  '/components/icons/TrashIcon.tsx',
  '/components/icons/TrophyIcon.tsx',
  '/components/icons/TshirtIcon.tsx',
  '/components/icons/UploadIcon.tsx',
  '/components/icons/UserIcon.tsx',
  '/components/icons/UserPlusIcon.tsx',
  '/components/icons/UsersElevenIcon.tsx',
  '/components/icons/UsersFiveIcon.tsx',
  '/components/icons/UsersIcon.tsx',
  '/components/icons/UsersSevenIcon.tsx',
  '/components/icons/WeatherIcon.tsx',
  '/components/icons/WeightScaleIcon.tsx',
  '/components/icons/WindIcon.tsx',
  '/components/icons/WhatsappIcon.tsx',
  '/components/icons/XIcon.tsx',
  '/components/icons/YellowCardIcon.tsx',

  // Views
  '/views/AdminDashboard.tsx',
  '/views/AppearanceSettings.tsx',
  '/views/Booking.tsx',
  '/views/BookingConfirmation.tsx',
  '/views/BookingDetailView.tsx',
  '/views/BookingsView.tsx',
  '/views/FieldDetail.tsx',
  '/views/ForgotPassword.tsx',
  '/views/HelpView.tsx',
  '/views/Home.tsx',
  '/views/Login.tsx',
  '/views/MapView.tsx',
  '/views/OwnerPendingVerificationView.tsx',
  '/views/OwnerRegisterView.tsx',
  '/views/PaymentMethodsView.tsx',
  '/views/ProfileView.tsx',
  '/views/Register.tsx',
  '/views/SearchResults.tsx',
  '/views/SocialView.tsx',
  '/views/SuperAdminDashboard.tsx',
  '/views/UserProfile.tsx',
  '/views/forum/PostCard.tsx',
  '/views/forum/SportsForumView.tsx',
  '/views/player_profile/PlayerProfileCreatorView.tsx',
  '/views/player_profile/PlayerProfileDetailView.tsx',
  '/views/team/CreateTeamView.tsx',
  '/views/team/MyTeamDashboard.tsx',
  '/views/team/PerformanceView.tsx',
  '/views/team/RosterView.tsx',
  '/views/team/ScheduleView.tsx',
  '/views/team/TacticsView.tsx',
  '/views/team/TeamChatView.tsx',
  '/views/team/TeamInfoView.tsx',

  // Data
  '/data/mockUsers.ts',

  // CDNs
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://ideogram.ai/assets/image/lossless/response/zjy_oza2RB2xuDygg3HR-Q',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js',
  
  // React via importmap
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/',
  '@google/genai': 'https://aistudiocdn.com/@google/genai@^1.28.0'
];

self.addEventListener('install', event => {
  // Prevent the worker from waiting until the old one is gone
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching assets');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
