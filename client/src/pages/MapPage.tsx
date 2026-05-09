import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { rescueApi, shelterApi } from "../services/apiService";
import type { RescueRequest, Shelter } from "../types/rescue";
import { LifeBuoy, Shield, Layers } from "lucide-react";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const rescueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const shelterIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const urgencyColors: Record<string, string> = {
  CRITICAL: "bg-semantic-error", HIGH: "bg-brand-orange-deep", MEDIUM: "bg-link", LOW: "bg-semantic-success",
};

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [50, 50], maxZoom: 13 });
    }
  }, [map, positions]);
  return null;
}

export function MapPage() {
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [showRequests, setShowRequests] = useState(true);
  const [showShelters, setShowShelters] = useState(true);

  useEffect(() => {
    rescueApi.getAll().then(setRequests).catch(() => {});
    shelterApi.getAll().then(setShelters).catch(() => {});
  }, []);

  const allPositions: [number, number][] = [
    ...(showRequests ? requests.filter(r => r.latitude && r.longitude).map(r => [r.latitude, r.longitude] as [number, number]) : []),
    ...(showShelters ? shelters.filter(s => s.latitude && s.longitude).map(s => [s.latitude, s.longitude] as [number, number]) : []),
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Bản đồ trực quan</h1>
          <p className="text-sm text-slate">Vị trí yêu cầu cứu hộ và điểm an toàn trên bản đồ</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowRequests(!showRequests)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${showRequests ? "bg-semantic-error/10 text-semantic-error" : "bg-surface text-slate"}`}>
            <LifeBuoy size={14} /> Cứu hộ
          </button>
          <button onClick={() => setShowShelters(!showShelters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${showShelters ? "bg-semantic-success/10 text-semantic-success" : "bg-surface text-slate"}`}>
            <Shield size={14} /> Điểm an toàn
          </button>
        </div>
      </div>

      <div className="card overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        <MapContainer center={[15.8, 108.2]} zoom={10} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={allPositions} />

          {showRequests && requests.filter(r => r.latitude && r.longitude).map(req => (
            <Marker key={`req-${req.id}`} position={[req.latitude, req.longitude]} icon={rescueIcon}>
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${urgencyColors[req.urgencyLevel] || "bg-slate"}`} />
                    <span className="text-xs font-semibold">{req.urgencyLevel}</span>
                    <span className="text-xs text-slate">·</span>
                    <span className="text-xs font-medium">{req.status}</span>
                  </div>
                  <p className="text-sm font-medium mb-1">{req.description}</p>
                  <p className="text-xs text-slate">📍 {req.location}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {showShelters && shelters.filter(s => s.latitude && s.longitude).map(shelter => (
            <Marker key={`shelter-${shelter.id}`} position={[shelter.latitude, shelter.longitude]} icon={shelterIcon}>
              <Popup>
                <div className="min-w-[200px]">
                  <p className="text-sm font-semibold mb-1">{shelter.name}</p>
                  <p className="text-xs text-slate mb-1">📍 {shelter.location}</p>
                  <div className="flex gap-3 text-xs">
                    <span>Sức chứa: <strong>{shelter.capacity}</strong></span>
                    <span>Đang ở: <strong>{shelter.currentOccupancy}</strong></span>
                  </div>
                  <div className="mt-1">
                    <span className={`text-xs font-medium ${shelter.status === "OPEN" ? "text-brand-green" : "text-semantic-error"}`}>
                      {shelter.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="card p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-xs">
          <Layers size={14} className="text-slate" />
          <span className="font-medium text-ink">Chú thích:</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" className="h-5" />
          <span>Yêu cầu cứu hộ</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png" className="h-5" />
          <span>Điểm an toàn</span>
        </div>
        {Object.entries(urgencyColors).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${v}`} />
            <span>{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
