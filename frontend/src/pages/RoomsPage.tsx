import { rooms } from '../data/mockData';

export const RoomsPage = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Rooms</h1>
        <p className="text-gray-600">Discover your perfect stay</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg border p-5">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">Room {room.number}</h3>
            <p className="text-sm text-gray-500 capitalize mb-2">{room.type} Room · Floor {room.floor}</p>
            <p className="text-sm text-gray-600 mb-3">{room.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">${room.pricePerNight}</span>
              <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">{room.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};