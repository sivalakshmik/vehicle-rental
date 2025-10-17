import { Link } from 'react-router-dom';

function VehicleCard({ vehicle }) {
  return (
    <div className="bg-card rounded-lg shadow p-4">
      <img src={vehicle.image} alt={vehicle.make} className="w-full h-48 object-cover rounded mb-2" />
      <h2 className="text-xl font-semibold text-text">{vehicle.make} {vehicle.model}</h2>
      <p className="text-sm text-gray-600">{vehicle.location}</p>
      <p className="text-primary font-bold mt-1">₹{vehicle.pricePerDay}/day</p>
      <Link to={`/vehicle/${vehicle._id}`} className="mt-3 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-orange-600">
        View Details
      </Link>
    </div>
  );
}

export default VehicleCard;
