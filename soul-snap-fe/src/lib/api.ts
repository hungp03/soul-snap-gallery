import axios from '@/lib/axios';

export const getPhotos = async () => {
  const response = await axios.get('/photos');
  return response.data;
};