* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #0f0f1a;
  color: #e0e0e0;
  min-height: 100vh;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 1rem 2rem;
  border-bottom: 2px solid #2a2a4a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header h1 {
  font-size: 1.8rem;
  background: linear-gradient(135deg, #f7971e, #ffd200);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-header .badge {
  font-size: 0.8rem;
  background: #2a2a4a;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  color: #888;
  -webkit-text-fill-color: #888;
  border: 1px solid #3a3a5a;
}

.app-header .status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #888;
}

.app-header .status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.ready {
  background: #00b894;
  animation: pulse-green 2s infinite;
}

.status-dot.loading {
  background: #fdcb6e;
  animation: pulse-yellow 1s infinite;
}

.status-dot.error {
  background: #d63031;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes pulse-yellow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.app-main {
  flex: 1;
  padding: 1.5rem;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.dungeon-container {
  background: #1a1a2e;
  border-radius: 16px;
  border: 1px solid #2a2a4a;
  padding: 1.5rem;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  position: relative;
}

.dungeon-container svg {
  max-width: 100%;
  height: auto;
  background: #1a1a2e;
  border-radius: 8px;
}

.dungeon-placeholder {
  color: #555;
  font-size: 1.2rem;
  text-align: center;
  padding: 3rem;
}

.dungeon-placeholder span {
  display: block;
  font-size: 4rem;
  margin-bottom: 1rem;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  gap: 1rem;
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #2a2a4a;
  border-top-color: #f7971e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.export-section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem 0;
  border-top: 1px solid #2a2a4a;
  margin-top: 0.5rem;
}

.export-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.export-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.export-btn.svg {
  background: #2d3436;
  color: #dfe6e9;
}

.export-btn.svg:hover:not(:disabled) {
  background: #3d4a4c;
}

.export-btn.png {
  background: #6c5ce7;
  color: #fff;
}

.export-btn.png:hover:not(:disabled) {
  background: #7d6def;
}

.export-btn.print {
  background: #00b894;
  color: #fff;
}

.export-btn.print:hover:not(:disabled) {
  background: #00a884;
}

.export-btn.save {
  background: #fdcb6e;
  color: #1a1a2e;
}

.export-btn.save:hover:not(:disabled) {
  background: #fdcb6e;
}

.status-message {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  animation: fadeIn 0.3s ease;
}

.status-message.success {
  background: rgba(0, 184, 148, 0.15);
  color: #00b894;
  border: 1px solid rgba(0, 184, 148, 0.3);
}

.status-message.error {
  background: rgba(214, 48, 49, 0.15);
  color: #d63031;
  border: 1px solid rgba(214, 48, 49, 0.3);
}

.status-message.info {
  background: rgba(108, 92, 231, 0.15);
  color: #6c5ce7;
  border: 1px solid rgba(108, 92, 231, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .app-header {
    padding: 0.75rem 1rem;
  }
  
  .app-header h1 {
    font-size: 1.3rem;
  }
  
  .app-main {
    padding: 0.75rem;
    gap: 1rem;
  }
  
  .dungeon-container {
    padding: 0.75rem;
    min-height: 300px;
  }
  
  .export-section {
    gap: 0.5rem;
  }
  
  .export-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .app-header h1 {
    font-size: 1.1rem;
  }
  
  .app-header .badge {
    font-size: 0.6rem;
    padding: 0.15rem 0.5rem;
  }
  
  .dungeon-container {
    min-height: 200px;
    padding: 0.5rem;
  }
}
