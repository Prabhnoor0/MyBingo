
const JAMENDO_API_BASE = "https://api.jamendo.com/v3.0"
const CLIENT_ID = "fdba5158" 

class JamendoAPI {
  constructor() {
    this.clientId = CLIENT_ID
  }

  // Search for tracks
  async searchTracks(query, limit = 20) {
    try {
      console.log('Jamendo API: Searching for tracks:', query, 'with limit:', limit)
      const response = await fetch(
        `${JAMENDO_API_BASE}/tracks/?client_id=${this.clientId}&format=json&limit=${limit}&search=${encodeURIComponent(query)}&include=musicinfo&groupby=artist_id&audioformat=mp31`,
      )
      console.log('Jamendo API: Search response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Jamendo API: Search response data:', data)
      
      if (!data.results) {
        console.warn('Jamendo API: No results in response')
        return []
      }
      
      return data.results
    } catch (error) {
      console.error("Jamendo API: Error searching tracks:", error)
      throw error
    }
  }

  // Get tracks by genre
  async getTracksByGenre(genre, limit = 20) {
    try {
      console.log('Jamendo API: Getting tracks by genre:', genre, 'with limit:', limit)
      const response = await fetch(
        `${JAMENDO_API_BASE}/tracks/?client_id=${this.clientId}&format=json&limit=${limit}&tags=${genre}&include=musicinfo&groupby=artist_id&audioformat=mp31`,
      )
      console.log('Jamendo API: Genre response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Jamendo API: Genre response data:', data)
      
      if (!data.results) {
        console.warn('Jamendo API: No results in genre response')
        return []
      }
      
      return data.results
    } catch (error) {
      console.error("Jamendo API: Error fetching tracks by genre:", error)
      throw error
    }
  }

  // Get popular tracks
  async getPopularTracks(limit = 20) {
    try {
      console.log('Jamendo API: Getting popular tracks with limit:', limit)
      const response = await fetch(
        `${JAMENDO_API_BASE}/tracks/?client_id=${this.clientId}&format=json&limit=${limit}&order=popularity_total&include=musicinfo&groupby=artist_id&audioformat=mp31`,
      )
      console.log('Jamendo API: Popular tracks response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Jamendo API: Popular tracks response data:', data)
      
      if (!data.results) {
        console.warn('Jamendo API: No results in popular tracks response')
        return []
      }
      
      return data.results
    } catch (error) {
      console.error("Jamendo API: Error fetching popular tracks:", error)
      throw error
    }
  }

  // Get calming/relaxing tracks
  async getCalmingTracks(limit = 20) {
    try {
      console.log('Jamendo API: Getting calming tracks with limit:', limit)
      const calmingTags = ["ambient", "chillout", "relaxation", "meditation", "peaceful"]
      const randomTag = calmingTags[Math.floor(Math.random() * calmingTags.length)]
      console.log('Jamendo API: Using tag:', randomTag)
      const tracks = await this.getTracksByGenre(randomTag, limit)
      console.log('Jamendo API: Got tracks:', tracks)
      return tracks
    } catch (error) {
      console.error('Jamendo API: Error getting calming tracks:', error)
      throw error
    }
  }
}

export default new JamendoAPI()
