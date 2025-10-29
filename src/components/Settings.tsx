import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { LogOut } from 'lucide-react';

type SettingsProps = {
  userEmail: string;
  onLogout: () => void;
};

export function Settings({ userEmail, onLogout }: SettingsProps) {
  // Extract first and last name from email (simple implementation)
  const getNameFromEmail = (email: string) => {
    const namePart = email.split('@')[0];
    const parts = namePart.split('.');
    if (parts.length >= 2) {
      return {
        firstName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
        lastName: parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
      };
    }
    return {
      firstName: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      lastName: ''
    };
  };

  const { firstName, lastName } = getNameFromEmail(userEmail);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        {/* User Information Card */}
        <Card className="p-8 mb-8">
          <h2 className="text-gray-900 mb-6">User Information</h2>
          
          <div className="space-y-6">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {firstName}
              </div>
              <p className="text-gray-500">From your connected Google account</p>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {lastName || 'N/A'}
              </div>
              <p className="text-gray-500">From your connected Google account</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email Address</Label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {userEmail}
              </div>
              <p className="text-gray-500">Your OAuth email address</p>
            </div>
          </div>
        </Card>

        {/* Account Actions Card */}
        <Card className="p-8">
          <h2 className="text-gray-900 mb-6">Account Actions</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Signing out will end your current session and return you to the login screen.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg" className="w-full sm:w-auto">
                  <LogOut className="mr-2 w-5 h-5" />
                  Log Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be returned to the login screen and will need to sign in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onLogout}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Log Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>
    </div>
  );
}
