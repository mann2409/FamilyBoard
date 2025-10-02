# Family Helper Board

A comprehensive family coordination app built with React Native and Expo that helps family members manage and share tasks like babysitting, dog sitting, pickups, and more.

## Features

### 🔐 Authentication
- Simple login/signup system for family members
- Persistent authentication using Zustand + AsyncStorage
- Family member management

### 📅 Calendar View
- Monthly calendar view showing all family requests
- Color-coded by status (Open, Claimed, Completed)
- Interactive day cells showing up to 2 requests per day
- Navigation between months
- Tap on requests to view details

### 📋 Activity Feed
- **Upcoming Requests**: Future tasks that need attention
- **My Requests**: All requests you've posted or claimed
- **Completed Requests**: History of finished tasks
- Pull-to-refresh functionality
- Overdue indicator for past due requests

### ➕ Create Requests
- Four request types: Babysitting, Dog Sitting, Pickup, Other
- Date and time picker
- Optional notes/description field
- Floating action button for quick access

### 🔔 Push Notifications
- Instant notifications when new requests are posted
- Notifications when your request is claimed
- Notifications when tasks are completed
- Reminder notifications 1 hour before scheduled tasks
- Tap notification to navigate directly to request details

### 📱 Request Management
- **Open Requests**: Available for family members to claim
- **Claim Requests**: Accept responsibility for helping
- **Complete Requests**: Mark tasks as done
- Detailed view showing:
  - Request type and title
  - Scheduled date and time
  - Who posted it
  - Who claimed it (if applicable)
  - Additional notes
  - Status history

### 👥 Profile & Family
- View your profile information
- See statistics (Posted, Claimed, Unread notifications)
- List of all family members
- Logout functionality

## Request Lifecycle

1. **Open**: Request is posted and awaiting someone to claim it
2. **Claimed**: A family member has accepted the request
3. **Completed**: The task has been finished

## Technical Stack

- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **State Management**: Zustand with AsyncStorage persistence
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Notifications**: expo-notifications
- **Date Handling**: date-fns
- **UI Components**: Custom components with Ionicons

## How to Use

1. **Sign Up/Login**: Enter your name and email to join your family board
2. **Create Request**: Tap the blue + button to create a new request
3. **View Calendar**: See all requests on the calendar view
4. **Check Activity**: Review upcoming, your own, and completed requests
5. **Claim Request**: Tap on an open request and claim it to help
6. **Complete Task**: After finishing, mark the request as completed
7. **Get Notified**: Receive push notifications for new requests, claims, and reminders

## Permissions Required

- **Notifications**: For push notifications and reminders

## Notes

- All data is stored locally using AsyncStorage
- Notifications work on physical devices (simulator support may be limited)
- The app is optimized for iOS following Apple's Human Interface Guidelines
- Family members are automatically added when they sign up with unique emails
