import './css/style.css';
import { FetchImagesFunction } from './js/FetchImagesFunction';
import { Notify } from 'notiflix';
import { LoadMore_Btn } from './js/load-more-btn';
const fetchImages = new FetchImagesFunction();
const loadMoreBtn = new LoadMore_Btn({ selector: '.load-more', hidden: true });
const refs = {
  formSearch: document.querySelector('#search-form'),
  divGallery: document.querySelector('.gallery'),
};

function onSearch(e) {
  e.preventDefault();
  const currentWord = e.currentTarget.elements.searchQuery.value.trim();
  if (currentWord === '') {
    return Notify.info(`Write word for search photo`);
  }
  fetchImages.searchQuery = currentWord;
  loadMoreBtn.show();
  fetchImages.resetPage();
  clearImageContainer();
  fetchImages_fnt();
}

function clearImageContainer() {
  refs.divGallery.innerHTML = '';
}

function fetchImages_fnt() {
  loadMoreBtn.disabled();
  fetchImages
    .fetchImages()
    .then(({ data }) => {
      if (data.total === 0) {
        Notify.info(
          `Sorry, there are no images matching your search query: ${FetchImagesFunction.searchQuery}. Please try again.`
        );
        loadMoreBtn.hide();
        return;
      }
      appendImagesMarkup(data);
      const { totalHits } = data;

      if (refs.divGallery.children.length === totalHits) {
        Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
        loadMoreBtn.hide();
      } else {
        loadMoreBtn.enable();
        Notify.success(`Hooray! We found ${totalHits} images.`);
      }
    })
    .catch(handleError);
}

function handleError() {
  console.log('Error!');
}

function appendImagesMarkup(data) {
  refs.divGallery.insertAdjacentHTML('beforeend', makeImageMarkup(data));
}
function makeImageMarkup({ hits }) {
  const markup = hits.map(
    ({
      largeImageURL,
      webformatURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => `<div class="photo-card">
    <a class="gallery-item" href="${largeImageURL}"><img class="gallery-image" src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
    <div class="info">
    <p class="info-item">
        <b>Likes: </b></br>${likes}
    </p>
    <p class="info-item">
        <b>Views: </b></br>${views}
    </p>
    <p class="info-item">
        <b>Comments: </b></br>${comments}
    </p>
    <p class="info-item">
        <b>Downloads: </b></br>${downloads}
    </p>
    </div></div>`
  );

  return markup.join('');
}
refs.formSearch.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', fetchImages_fnt);
