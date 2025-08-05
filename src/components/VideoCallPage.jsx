import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  ref,
  get,
  onDisconnect,
  onValue,
  push,
  remove,
  set,
  off,
} from "firebase/database";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const VideoCallPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidates = useRef([]);

  const [status, setStatus] = useState("Connecting...");

  // Keep unsubscribe functions
  const answerUnsubRef = useRef(null);
  const candidatesUnsubRef = useRef(null);

  useEffect(() => {
    if (!requestId) {
      alert("Missing request ID");
      navigate("/");
      return;
    }

    start();

    return () => cleanup();
    // eslint-disable-next-line
  }, []);

  const start = async () => {
    pcRef.current = new RTCPeerConnection(configuration);

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = localStream;
    localStream.getTracks().forEach((track) => {
      pcRef.current.addTrack(track, localStream);
    });

    localVideoRef.current.srcObject = localStream;

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateRef = ref(db, `calls/${requestId}/candidates`);
        const newCandidate = push(candidateRef);
        set(newCandidate, event.candidate.toJSON());
      }
    };

    pcRef.current.ontrack = (event) => {
      const [remoteStream] = event.streams;
      remoteVideoRef.current.srcObject = remoteStream;
    };

    // 🔁 Determine if we are the offerer
    const offerRef = ref(db, `calls/${requestId}/offer`);
    const offerSnapshot = await get(offerRef);
    const isOfferer = !offerSnapshot.exists();

    if (isOfferer) {
      console.log("I am the offerer.");
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      await set(offerRef, offer);
    } else {
      console.log("I am the answerer.");
      const offer = offerSnapshot.val();
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      await set(ref(db, `calls/${requestId}/answer`), answer);
      setStatus("Call Connected");

      for (const c of pendingCandidates.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
        } catch (err) {
          console.warn("Error adding ICE candidate:", err);
        }
      }
      pendingCandidates.current = [];
    }

    // 👂 Listen for Answer (only if offerer)
    if (isOfferer) {
      const answerRef = ref(db, `calls/${requestId}/answer`);
      answerUnsubRef.current = onValue(answerRef, async (snapshot) => {
        if (!pcRef.current || pcRef.current.signalingState === "closed") return;

        const answer = snapshot.val();
        if (answer && !pcRef.current.currentRemoteDescription) {
          try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            setStatus("Call Connected");

            for (const c of pendingCandidates.current) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
            }
            pendingCandidates.current = [];
          } catch (err) {
            console.warn("Failed to set remote description:", err);
          }
        }
      });
    }

    // 👂 Listen for ICE candidates (both sides)
    const candidateRef = ref(db, `calls/${requestId}/candidates`);
    candidatesUnsubRef.current = onValue(candidateRef, (snapshot) => {
      if (!pcRef.current || pcRef.current.signalingState === "closed") return;

      const data = snapshot.val();
      if (data) {
        Object.values(data).forEach((c) => {
          if (
            pcRef.current?.remoteDescription &&
            pcRef.current.remoteDescription.type
          ) {
            pcRef.current
              .addIceCandidate(new RTCIceCandidate(c))
              .catch((err) =>
                console.warn("Error adding ICE candidate:", err)
              );
          } else {
            pendingCandidates.current.push(c);
          }
        });
      }
    });

    // Clean up call when connection lost
    onDisconnect(ref(db, `calls/${requestId}`)).remove();
  };

  const cleanup = async () => {
    if (answerUnsubRef.current) {
      const answerRef = ref(db, `calls/${requestId}/answer`);
      off(answerRef);
    }
    if (candidatesUnsubRef.current) {
      const candidateRef = ref(db, `calls/${requestId}/candidates`);
      off(candidateRef);
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (pcRef.current) {
      pcRef.current.close();
    }

    await remove(ref(db, `calls/${requestId}`));
  };

  const handleLeave = () => {
    cleanup().then(() => navigate("/"));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-black bg-opacity-30 backdrop-blur p-4 text-center border-b border-white/20">
        <h2 className="text-white text-xl font-semibold">📞 Video Call</h2>
        <div
          className="mt-2 inline-flex items-center px-4 py-1 rounded-full text-sm font-medium text-white"
          style={{
            backgroundColor: status === "Call Connected" ? "#15803d33" : "#facc1533",
            border: `1px solid ${
              status === "Call Connected" ? "#15803d66" : "#facc1566"
            }`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full mr-2"
            style={{
              backgroundColor: status === "Call Connected" ? "#22c55e" : "#fbbf24",
              animation: status === "Call Connected" ? "none" : "pulse 2s infinite",
            }}
          ></div>
          {status}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center gap-8 p-8 relative">
        {/* Remote Video */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-black/20">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-[500px] h-[375px] object-cover"
          />
          <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm font-medium">
            👥 Partner
          </div>
        </div>

        {/* Local Video (PiP) */}
        <div className="absolute top-6 right-6 w-[200px] h-[150px] rounded-xl overflow-hidden shadow-xl border-2 border-white/20 bg-black/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs font-medium">
            📹 You
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black bg-opacity-30 backdrop-blur p-6 text-center border-t border-white/20">
        <button
          onClick={handleLeave}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full text-lg shadow-lg transition transform hover:-translate-y-0.5"
        >
          ❌ Leave Call
        </button>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default VideoCallPage;
