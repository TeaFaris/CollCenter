import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../../store/StoreGetToken';
import apiClient from '../../../utils/api';

export default function Task() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [fetching, setFetching] = useState(true);
  const { refreshAccessToken } = getToken(state => ({
    refreshAccessToken: state.refreshAccessToken
  }))


  async function fetchData() {
    try {
      const token = localStorage.getItem('accessToken');
      setLoading(true);
      if (token) {
        const response = await apiClient.get(`/api/tasks/all?pagination.limit=25&pagination.page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (Array.isArray(response.data.tasks)) {
          setData((prev) => [...prev, ...response.data.tasks]);
        } else {
          console.error('Ожидался массив, но получен другой тип данных:', response.data.tasks);
        }
        console.log(response.data);

        setCurrentPage((el) => el + 1);
        setTotalCount(response.headers['x-total-count']);
      } else {
        console.error('Access token отсутствует');
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      if(error.response.status === 401){
        let accessToken = refreshAccessToken()
        let booleanRes = Boolean(accessToken)
        if(booleanRes){
          setFetching(true)
        }
        console.log(error.response.status);
        console.log(`Аксес токен обнавлен: ${accessToken}`);
      }
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }

  const scrollHandler = (e) => {
    console.log('scroll');
    const target = e.target;
    if (target.scrollHeight - (target.scrollTop + target.clientHeight) < 100 && data.length < totalCount) {
      setFetching(true);
    }
  };

  useEffect(() => {
    if (fetching) {
      fetchData();
    }
  }, [fetching]);

  return (
    <div className='MessBox'>
      <div className="mainTask">
        <h1>Задачи</h1>
        <Link to='/create-task' className='linkMess'>Создать задачу</Link>
      </div>
      <div onScroll={scrollHandler} className="ulLiDataMess">
        {loading ? <p>loading...</p> : data.map((prev, i) =>
          <div key={i} className='itemsMessContent'>
            <div>
              <div></div>
              <input type="text" onChange={(prev) => prev.target.value = prev.subject} value={prev.subject ?? ''} />
              <input type="text" onChange={(prev) => prev.target.value = prev.body} value={prev.creator.name ?? ''} />
              <input type="text" onChange={(prev) => prev.target.value = prev.string} value={prev.startDate ?? ''} />
              <input type="text" onChange={(prev) => prev.target.value = prev.string} value={prev.dueDate ?? ''} />
            </div>
            <h1>{prev.time}</h1>
          </div>)}
      </div>
    </div>
  );
}
