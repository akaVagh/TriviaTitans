import Navbar from './components/miscelleneous/Navbar';
import Routes from './services/Routes';
import { AuthProvider } from './services/AuthContext';
import WebSocketProvider from './components/WebSocketContext/WebSocketProvider';

function App() {
	return (
		<WebSocketProvider>
			<AuthProvider>
				<Navbar />
				<Routes />
			</AuthProvider>
		</WebSocketProvider>
	);
}

export default App;
