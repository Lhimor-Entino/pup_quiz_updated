import React from 'react'

type Props = {}

const LeaderBoardIcon = (props: Props) => {
  return (
    <div className="w-full max-h-14 flex  justify-end mt-5 hover:cursor-pointer ">
      <div className="relative text-end  " style={{ perspective: '1000px' }}>
        <div className="flex items-end gap-2" style={{ 
          transformStyle: 'preserve-3d',
          animation: 'float 3s ease-in-out infinite'
        }}>
          {/* Second Place - Silver */}
          <div className="flex flex-col items-center" style={{
            animation: 'bounce 2s ease-in-out infinite',
            animationDelay: '0.2s'
          }}>
            <div className="text-white text-1xl font-bold mb-2 drop-shadow-lg">2</div>
            <div 
              className="relative"
              style={{
                width: '20px',
                height: '40px',
                background: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 50%, #A8A8A8 100%)',
                transformStyle: 'preserve-3d',
                transform: 'rotateY(-15deg)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.2)',
                borderRadius: '8px',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-20px',
                width: '20px',
                height: '100%',
                background: 'linear-gradient(90deg, #A0A0A0 0%, #C0C0C0 100%)',
                transformOrigin: 'right',
                transform: 'rotateY(90deg)',
                borderRadius: '8px 0 0 8px'
              }}></div>
            </div>
          </div>

          {/* First Place - Gold */}
          <div className="flex flex-col items-center" style={{
            animation: 'bounce 2s ease-in-out infinite',
            animationDelay: '0s'
          }}>
            <div className="text-yellow-300 text-1xl font-bold mb-2 drop-shadow-lg" style={{
              textShadow: '0 0 20px rgba(255,215,0,0.8)'
            }}>1</div>
            <div 
              className="relative"
              style={{
                width: '20px',
                height: '50px',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFF4A3 50%, #FFA500 100%)',
                transformStyle: 'preserve-3d',
                transform: 'rotateY(-15deg)',
                boxShadow: '0 30px 60px rgba(255,215,0,0.4), inset 0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,215,0,0.3)',
                borderRadius: '8px',
                animation: 'pulse 2s ease-in-out infinite, glow 2s ease-in-out infinite'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-20px',
                width: '20px',
                height: '100%',
                background: 'linear-gradient(90deg, #DAA520 0%, #FFD700 100%)',
                transformOrigin: 'right',
                transform: 'rotateY(90deg)',
                borderRadius: '8px 0 0 8px'
              }}></div>
            </div>
          </div>

          {/* Third Place - Bronze */}
          <div className="flex flex-col items-center" style={{
            animation: 'bounce 2s ease-in-out infinite',
            animationDelay: '0.4s'
          }}>
            <div className="text-white text-1xl font-bold mb-2 drop-shadow-lg">3</div>
            <div 
              className="relative"
              style={{
                width: '20px',
                height: '30px',
                background: 'linear-gradient(135deg, #CD7F32 0%, #E9967A 50%, #8B4513 100%)',
                transformStyle: 'preserve-3d',
                transform: 'rotateY(-15deg)',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.1)',
                borderRadius: '8px',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-20px',
                width: '20px',
                height: '100%',
                background: 'linear-gradient(90deg, #A0522D 0%, #CD7F32 100%)',
                transformOrigin: 'right',
                transform: 'rotateY(90deg)',
                borderRadius: '8px 0 0 8px'
              }}></div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotateY(-5deg);
            }
            50% {
              transform: translateY(-20px) rotateY(5deg);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0px) scale(1);
            }
            50% {
              transform: translateY(-10px) scale(1.05);
            }
          }

          @keyframes pulse {
            0%, 100% {
              filter: brightness(1);
            }
            50% {
              filter: brightness(1.2);
            }
          }

          @keyframes glow {
            0%, 100% {
              box-shadow: 0 30px 60px rgba(255,215,0,0.4), inset 0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,215,0,0.3);
            }
            50% {
              box-shadow: 0 30px 60px rgba(255,215,0,0.6), inset 0 0 20px rgba(255,255,255,0.4), 0 0 60px rgba(255,215,0,0.5);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default LeaderBoardIcon