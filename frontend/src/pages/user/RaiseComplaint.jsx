import { useState } from "react";
import {
  Upload,
  MapPin,
  Image,
  FileText,
  Send,
  X,
  Loader2,
} from "lucide-react";

function RaiseComplaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setError("");
    setImage(file);
  };

  const captureLocation = () => {
    setError("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationLoading(false);
      },
      () => {
        setError(
          "Unable to access location. Please allow location permission.",
        );
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !description.trim()) {
      setError("Please enter the complaint title and description.");
      return;
    }

    if (!location) {
      setError("Please capture your device location.");
      return;
    }

    // Temporary frontend demonstration.
    // Backend API integration will be added later.
    setSuccess(
      "Complaint form validated successfully! Backend submission is not connected yet.",
    );

    console.log({
      title,
      description,
      image,
      location,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Raise a Complaint</h1>
        <p className="mt-2 text-sm text-slate-500">
          Report a campus issue so the concerned department can take action.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {/* Complaint Title */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Complaint Title *
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Water leakage in Hostel Block A"
            className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Complaint Description *
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail. Mention when and where it occurred..."
            className="w-full resize-none rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-xs text-slate-400">
            Provide enough details to help the concerned department understand
            the issue.
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Upload Complaint Image
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 transition hover:border-blue-500 hover:bg-blue-50">
            <Upload size={30} className="text-blue-600" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              Click to upload an image
            </p>

            <p className="mt-1 text-xs text-slate-400">
              PNG, JPG or JPEG (Maximum 5 MB)
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {image && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <Image size={20} className="text-blue-600" />
                <span className="text-sm text-slate-700">{image.name}</span>
              </div>

              <button
                type="button"
                onClick={() => setImage(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Device Location */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Complaint Location *
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                <MapPin size={23} />
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-slate-800">
                  Capture Device Location
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Allow browser location access to identify where the issue
                  occurred.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={captureLocation}
              disabled={locationLoading}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {locationLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin size={18} />
                  {location ? "Refresh Location" : "Get Current Location"}
                </>
              )}
            </button>

            {location && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                <p className="font-semibold">Location captured successfully!</p>
                <p className="mt-1">Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {success}
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end border-t border-slate-200 pt-5">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <Send size={18} />
            Submit Complaint
          </button>
        </div>
      </form>
    </div>
  );
}

export default RaiseComplaint;
