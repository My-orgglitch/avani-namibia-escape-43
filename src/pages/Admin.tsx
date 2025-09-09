import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, Edit, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Admin = () => {
  const [rooms, setRooms] = useState([]);
  const [activities, setActivities] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Form states
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    price_nad: '',
    capacity: '',
    size_sqm: '',
    amenities: '',
  });

  const [activityForm, setActivityForm] = useState({
    name: '',
    description: '',
    price_nad: '',
    duration: '',
    max_group_size: '',
    difficulty: '',
    highlights: '',
  });

  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    category: 'general',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsRes, activitiesRes, galleryRes, bookingsRes] = await Promise.all([
        supabase.from('rooms').select('*'),
        supabase.from('activities').select('*'),
        supabase.from('gallery').select('*'),
        supabase.from('bookings').select('*, rooms(name), activities(name)'),
      ]);

      if (roomsRes.data) setRooms(roomsRes.data);
      if (activitiesRes.data) setActivities(activitiesRes.data);
      if (galleryRes.data) setGallery(galleryRes.data);
      if (bookingsRes.data) setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const uploadImages = async (files: FileList, folder: string) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from(folder)
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from(folder)
        .getPublicUrl(fileName);
      
      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrls: string[] = [];
      if (selectedFiles) {
        imageUrls = await uploadImages(selectedFiles, 'room-images');
      }

      const { error } = await supabase.from('rooms').insert({
        ...roomForm,
        price_nad: parseInt(roomForm.price_nad),
        capacity: parseInt(roomForm.capacity),
        size_sqm: roomForm.size_sqm ? parseInt(roomForm.size_sqm) : null,
        amenities: roomForm.amenities.split(',').map(a => a.trim()),
        images: imageUrls,
      });

      if (error) throw error;

      toast.success('Room added successfully');
      setRoomForm({ name: '', description: '', price_nad: '', capacity: '', size_sqm: '', amenities: '' });
      setSelectedFiles(null);
      loadData();
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Failed to add room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrls: string[] = [];
      if (selectedFiles) {
        imageUrls = await uploadImages(selectedFiles, 'activity-images');
      }

      const { error } = await supabase.from('activities').insert({
        ...activityForm,
        price_nad: parseInt(activityForm.price_nad),
        max_group_size: parseInt(activityForm.max_group_size),
        highlights: activityForm.highlights.split(',').map(h => h.trim()),
        images: imageUrls,
      });

      if (error) throw error;

      toast.success('Activity added successfully');
      setActivityForm({ name: '', description: '', price_nad: '', duration: '', max_group_size: '', difficulty: '', highlights: '' });
      setSelectedFiles(null);
      loadData();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedFiles || selectedFiles.length === 0) {
        toast.error('Please select at least one image');
        return;
      }

      const imageUrls = await uploadImages(selectedFiles, 'gallery');

      const insertPromises = imageUrls.map(url => 
        supabase.from('gallery').insert({
          ...galleryForm,
          image_url: url,
        })
      );

      await Promise.all(insertPromises);

      toast.success('Images added to gallery successfully');
      setGalleryForm({ title: '', description: '', category: 'general' });
      setSelectedFiles(null);
      loadData();
    } catch (error) {
      console.error('Error adding to gallery:', error);
      toast.error('Failed to add to gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Gallery item deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast.error('Failed to delete item');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: status })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Booking status updated');
      loadData();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your guesthouse content and bookings</p>
        </div>

        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Room</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRoomSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="room-name">Room Name</Label>
                      <Input
                        id="room-name"
                        value={roomForm.name}
                        onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="room-price">Price (NAD)</Label>
                      <Input
                        id="room-price"
                        type="number"
                        value={roomForm.price_nad}
                        onChange={(e) => setRoomForm({ ...roomForm, price_nad: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="room-capacity">Capacity</Label>
                      <Input
                        id="room-capacity"
                        type="number"
                        value={roomForm.capacity}
                        onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="room-size">Size (sqm)</Label>
                      <Input
                        id="room-size"
                        type="number"
                        value={roomForm.size_sqm}
                        onChange={(e) => setRoomForm({ ...roomForm, size_sqm: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="room-description">Description</Label>
                    <Textarea
                      id="room-description"
                      value={roomForm.description}
                      onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="room-amenities">Amenities (comma-separated)</Label>
                    <Input
                      id="room-amenities"
                      value={roomForm.amenities}
                      onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                      placeholder="Wi-Fi, Air Conditioning, Private Bathroom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="room-images">Room Images</Label>
                    <Input
                      id="room-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Adding...' : 'Add Room'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Rooms ({rooms.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room: any) => (
                    <Card key={room.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="text-sm text-muted-foreground">{room.description}</p>
                        <div className="mt-2">
                          <Badge variant="outline">N${room.price_nad}/night</Badge>
                          <Badge variant="secondary" className="ml-2">{room.capacity} guests</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleActivitySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="activity-name">Activity Name</Label>
                      <Input
                        id="activity-name"
                        value={activityForm.name}
                        onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="activity-price">Price (NAD)</Label>
                      <Input
                        id="activity-price"
                        type="number"
                        value={activityForm.price_nad}
                        onChange={(e) => setActivityForm({ ...activityForm, price_nad: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="activity-duration">Duration</Label>
                      <Input
                        id="activity-duration"
                        value={activityForm.duration}
                        onChange={(e) => setActivityForm({ ...activityForm, duration: e.target.value })}
                        placeholder="2 hours"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="activity-group-size">Max Group Size</Label>
                      <Input
                        id="activity-group-size"
                        type="number"
                        value={activityForm.max_group_size}
                        onChange={(e) => setActivityForm({ ...activityForm, max_group_size: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="activity-difficulty">Difficulty</Label>
                    <Select value={activityForm.difficulty} onValueChange={(value) => setActivityForm({ ...activityForm, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Challenging">Challenging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="activity-description">Description</Label>
                    <Textarea
                      id="activity-description"
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="activity-highlights">Highlights (comma-separated)</Label>
                    <Input
                      id="activity-highlights"
                      value={activityForm.highlights}
                      onChange={(e) => setActivityForm({ ...activityForm, highlights: e.target.value })}
                      placeholder="Wildlife viewing, Sunset photography, Cultural experience"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activity-images">Activity Images</Label>
                    <Input
                      id="activity-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Adding...' : 'Add Activity'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Activities ({activities.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activities.map((activity: any) => (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{activity.name}</h3>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="mt-2">
                          <Badge variant="outline">N${activity.price_nad}/person</Badge>
                          <Badge variant="secondary" className="ml-2">{activity.duration}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add to Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGallerySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gallery-title">Title</Label>
                      <Input
                        id="gallery-title"
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="gallery-category">Category</Label>
                      <Select value={galleryForm.category} onValueChange={(value) => setGalleryForm({ ...galleryForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="rooms">Rooms</SelectItem>
                          <SelectItem value="activities">Activities</SelectItem>
                          <SelectItem value="dining">Dining</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gallery-description">Description</Label>
                    <Textarea
                      id="gallery-description"
                      value={galleryForm.description}
                      onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gallery-images">Images</Label>
                    <Input
                      id="gallery-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    <Upload className="w-4 h-4 mr-2" />
                    {isLoading ? 'Uploading...' : 'Add to Gallery'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gallery Items ({gallery.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {gallery.map((item: any) => (
                    <Card key={item.id}>
                      <CardContent className="p-2">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="p-2">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => deleteGalleryItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings ({bookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking: any) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{booking.guest_name}</h3>
                            <p className="text-sm text-muted-foreground">{booking.guest_email}</p>
                            <p className="text-sm">
                              {booking.booking_type === 'room' ? booking.rooms?.name : booking.activities?.name}
                            </p>
                            <p className="text-sm">Total: N${(booking.total_amount_nad / 100).toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}
                            >
                              {booking.payment_status}
                            </Badge>
                            <div className="mt-2 space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'paid')}
                              >
                                Mark Paid
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{bookings.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue (This Month)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    N${(bookings.reduce((sum: number, booking: any) => 
                      booking.payment_status === 'paid' ? sum + booking.total_amount_nad : sum, 0) / 100).toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {rooms.length > 0 ? Math.round((bookings.filter((b: any) => b.booking_type === 'room').length / rooms.length) * 100) : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Admin;