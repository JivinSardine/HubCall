let localStream, remoteStream, localPeerConnection, remotePeerConnection;

const startCall = async () => {
	try {
		// Get local stream
		localStream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});

		// Show local stream
		document.getElementById("localVideo").srcObject = localStream;

		// Create local peer connection
		localPeerConnection = new RTCPeerConnection();

		// Add local stream to local peer connection
		localStream.getTracks().forEach((track) => {
			localPeerConnection.addTrack(track, localStream);
		});

		// Create offer and set local description
		const offer = await localPeerConnection.createOffer();
		await localPeerConnection.setLocalDescription(offer);

		// Create remote peer connection
		remotePeerConnection = new RTCPeerConnection();

		// Set remote peer connection on ice candidate event
		localPeerConnection.addEventListener("icecandidate", (event) => {
			if (event.candidate) {
				remotePeerConnection.addIceCandidate(event.candidate);
			}
		});

		// Add remote stream to remote peer connection
		remotePeerConnection.addEventListener("track", (event) => {
			if (!remoteStream) {
				remoteStream = new MediaStream();
				document.getElementById("remoteVideo").srcObject = remoteStream;
			}

			remoteStream.addTrack(event.track, remoteStream);
		});

		// Set remote description and create answer
		await remotePeerConnection.setRemoteDescription(
			localPeerConnection.localDescription
		);
		const answer = await remotePeerConnection.createAnswer();
		await remotePeerConnection.setLocalDescription(answer);

		// Set local description on local peer connection
		await localPeerConnection.setRemoteDescription(answer);

	} catch (error) {
		console.error(error);
	}
};

const hangUp = () => {
	if (localPeerConnection) {
		localPeerConnection.close();
		localPeerConnection = null;
	}

	if (remotePeerConnection) {
		remotePeerConnection.close();
		remotePeerConnection = null;
	}

	if (localStream) {
		localStream.getTracks().forEach((track) => {
			track.stop();
		});
		localStream = null;
	}

	if (remoteStream) {
		remoteStream.getTracks().forEach((track) => {
			track.stop();
		});
		remoteStream = null;
	}

	document.getElementById("localVideo").srcObject = null;
	document.getElementById("remoteVideo").srcObject = null;
};
