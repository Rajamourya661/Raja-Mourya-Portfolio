import { SITE_URL } from '@/lib/siteConfig'
import { ImageResponse } from 'next/og'
import profile from '@/data/profile.json'

export const runtime = 'edge'

export const alt = `${profile.name.full} | ${profile.roles.short}`

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

const ACCENT = '#f7931e'
const photoUrl = `${SITE_URL}/assets/about.png`

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          background: '#050505',
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
          justifyContent: 'space-between',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -120,
            width: 500,
            height: 500,
            borderRadius: 999,
            background: 'rgba(247,147,30,0.15)',
          }}
        />

        {/* LEFT CONTENT */}
        <div
          style={{
            flex: 1,
            padding: '70px 60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* TOP LABEL */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: ACCENT,
                marginRight: 12,
              }}
            />

            <span
              style={{
                color: ACCENT,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}
            >
              {profile.roles.short.toUpperCase()}
            </span>
          </div>

          {/* NAME */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 0.88,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontSize: 92,
                fontWeight: 900,
                letterSpacing: -4,
              }}
            >
              {profile.name.first.toUpperCase()}
            </span>

            <span
              style={{
                fontSize: 92,
                fontWeight: 900,
                color: '#2d2d2d',
                letterSpacing: -4,
              }}
            >
              {profile.name.last.toUpperCase()}
            </span>
          </div>

          {/* DESCRIPTION */}
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.5,
              color: '#9d9d9d',
              maxWidth: 540,
              marginBottom: 34,
            }}
          >
            {profile.tagline}
          </div>

          {/* TAGS */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 36,
              flexWrap: 'wrap',
            }}
          >
            {profile.skills.slice(0, 4).map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '10px 18px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 999,
                  color: ACCENT,
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* STATS */}
          <div
            style={{
              display: 'flex',
              gap: 32,
            }}
          >
            {[
              [profile.stats[0].value, profile.stats[0].label],
              [profile.stats[1].value, profile.stats[1].label],
              ['VAPT+DFIR', 'Specialist'],
            ].map(([value, label]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span
                  style={{
                    fontSize: 34,
                    fontWeight: 900,
                    color: 'white',
                  }}
                >
                  {value}
                </span>

                <span
                  style={{
                    fontSize: 14,
                    color: '#7a7a7a',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            width: 420,
            height: 630,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* IMAGE */}
          <img
            src={photoUrl}
            width={420}
            height={630}
            alt={profile.name.full}
            style={{
              objectFit: 'cover',
            }}
          />

          {/* OVERLAY */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to left, transparent, rgba(5,5,5,0.9))',
            }}
          />
        </div>

        {/* FOOTER URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: 60,
            fontSize: 16,
            color: '#5f5f5f',
            letterSpacing: 2,
          }}
        >
          {SITE_URL.replace('https://', '')}
        </div>
      </div>
    ),
    size
  )
}