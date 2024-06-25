<script lang="ts">
	import { onMount } from 'svelte';
	let text: string[] = [];
	let isActive: boolean = false;
	let recognition: any;
	let socket: WebSocket;
	let audioElement: HTMLAudioElement;

	onMount(async () => {
		socket = new WebSocket('ws://localhost:3000');
		audioElement = document.getElementById('audio') as HTMLAudioElement;

		socket.onmessage = (event) => {
			recognition.stop();
			const audioBlob = new Blob([event.data], { type: 'audio/wav' });

			if (audioElement) {
				const audioUrl = URL.createObjectURL(audioBlob);
				audioElement.src = audioUrl;
				audioElement
					.play()
					.then(() => {
						console.log('Audio playback started');
					})
					.catch((error) => {
						console.error('Error starting audio playback:', error);
					});
			} else {
				console.error('Audio element not found');
			}
		};

		socket.onerror = (error) => {
			console.error('WebSocket error', error);
		};

		if (!('webkitSpeechRecognition' in window)) {
			alert("Your browser doesn't support speech recognition. Try Google Chrome.");
		} else {
			recognition = new webkitSpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = 'en-US';

			recognition.onstart = function () {
				console.log('Speech recognition started.');
			};

			recognition.onresult = function (event: { resultIndex: any; results: string | any[] }) {
				var transcript = '';
				for (var i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						transcript += event.results[i][0].transcript;
					}
				}
				if (transcript.length > 0) {
					socket.send(transcript);

					text.push(transcript);
					text = text;
				}
			};

			recognition.onerror = function (event: any) {
				console.log('Error occurred in recognition: ' + event.error);
			};

			recognition.onend = function () {
				console.log('Speech recognition ended.');
				isActive = false;
			};
		}
		document.body.addEventListener('click', () => {
			if (isActive) {
				return;
			}
			recognition.start();
			isActive = true;
		});
		audioElement.addEventListener('ended', () => {
			recognition.start();
		});
	});
</script>

<audio id="audio"></audio>

<div class="dot-container">
	<div class="dot"></div>
	<div class="dot"></div>
	<div class="dot"></div>
</div>

<style>
	:global(body) {
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		margin: 0;
	}
	:root {
		color-scheme: dark;
	}
	.dot-container {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
	}

	.dot {
		width: 200px;
		height: 200px;
		background-color: #3498db;
		border-radius: 50%;
		animation: bounce 0.6s infinite alternate;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes bounce {
		to {
			transform: translateY(-50px);
		}
	}
</style>
