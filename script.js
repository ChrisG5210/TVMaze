
const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const missingImg = "https://tinyurl.com/tv-missing"

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(query) {
    try {
        const response = await axios.get ('http://api.tvmaze.com/search/shows', {
            params: {
                q: query,
            }
        });
        return response.data.map(result => {
            const show = result.show;
            return {
                id: show.id,
                name: show.name,
                summary: show.summary,
                image: show.image ? show.image.medium : missingImg
            }
        })  
    } catch (error) {
        console.error('ERROR ALLOCATING SHOWS', error);
        throw error;
    }
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="http://static.tvmaze.com/uploads/images/medium_portrait/160/401704.jpg"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
    try {
        const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
        return response.data.map(episode => ({
        id: episode.id,
        name: episode.name,
        season: episode.season,
        number: episode.number
        }));
    } catch (error) {
        console.error(`Error getting episodes for show ${showID}:`, error);
        throw error;
    }
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
    const episodesList = $('#episodesList');
    episodesList.empty();

    episodes.forEach(episode => {
        const li = $('<li>').text(`${episode.name} season ${episode.season},
        number ${episode.number}`)
        episodesList.append(li);
    });
    $episodesArea.show();
}

$(document).on('click', '.Show-getEpisodes', async function () {
    const showId = $(this).closest('.Show').data('show-id');
    try{
        const episodes = await getEpisodesOfShow(showId);
        populateEpisodes(episodes)
    } catch {
        console.error('Error Allocating Episodes', error)
    }
})

