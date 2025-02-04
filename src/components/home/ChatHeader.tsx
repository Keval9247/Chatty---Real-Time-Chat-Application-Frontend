import { Headset, Video, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";

interface User {
    _id: string;
    username: string;
    profilePic?: string;
}

interface StoreState {
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;
}

interface AuthState {
    onlineUsers: string[];
}

interface SocketStore {
    socket: Socket | null;
    setSocket: (socket: Socket) => void;
}

const useSocketStore = create<SocketStore>((set) => ({
    socket: null,
    setSocket: (socket) => set({ socket }),
}));

const ChatHeader = () => {
    const { selectedUser, setSelectedUser }: StoreState | any = useChatStore();
    const { onlineUsers }: AuthState = useAuthStore();
    const [isCalling, setIsCalling] = useState<boolean>(false);
    console.log("🚀🚀 Your selected text is => isCalling: ", isCalling);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    console.log("🚀🚀 Your selected text is => remoteStream: ", remoteStream);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const { socket, setSocket } = useSocketStore();


    useEffect(() => {
        if (!socket) {
            const newSocket: Socket = io(`${import.meta.env.VITE_API_BASE_URL}`); // Change to your server URL
            setSocket(newSocket);
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, [socket, setSocket]);


    const handleUserImage = (userprofilepic: any): any => {
        if (userprofilepic?.includes('uploads/updatedImages')) {
            return `${import.meta.env.VITE_API_BASE_URL}/${userprofilepic}`
        }
        else {
            return "/images/avatar.png"
        }
    }

    const startCall = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log("Available devices:", devices);

            const hasMicrophone = devices.some(device => device.kind === "audioinput");
            if (!hasMicrophone) {
                console.error("No microphone found.");
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            setIsCalling(true);

            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });

            peerConnectionRef.current = peerConnection;

            stream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, stream);
            });

            peerConnection.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate && socket) {
                    socket.emit("ice-candidate", event.candidate);
                }
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            if (socket) socket.emit("offer", offer);
        } catch (error) {
            console.error("Error accessing audio devices", error);
        }
    };


    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="size-10 rounded-full relative">
                            <img src={selectedUser ? handleUserImage(selectedUser.profilePic) : "/images/avatar.png"} alt={selectedUser?.username || "User"} />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium">{selectedUser?.username}</h3>
                        <p className="text-sm text-base-content/70">
                            {onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>
                <div className="gap-10 flex">
                    <button onClick={startCall}>
                        <Headset />
                    </button>
                    <button>
                        <Video />
                    </button>
                    <button onClick={() => setSelectedUser(null)}>
                        <X />
                    </button>
                </div>

            </div>
        </div>
    );
};
export default ChatHeader;