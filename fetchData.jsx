const ExchangeRateCard = ({ currency, rate }) => {
  return (
    <div className="col-md-4">
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">{currency}</h5>
          <p className="card-text">
            <strong>Rate: </strong>
            {rate}
          </p>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ items, pageSize, onPageChange, currentPage }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  const numPages = Math.ceil(items.length / pageSize);
  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <nav className="d-flex justify-content-center my-3">
      <ul className="pagination">
        {pages.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            className={`page-item btn btn-secondary mx-1 ${
              page === currentPage ? "active" : ""
            }`}
          >
            {page}
          </Button>
        ))}
      </ul>
    </nav>
  );
};

const paginate = (items, pageNumber, pageSize) => {
  const start = (pageNumber - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };

    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);

  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, isLoading: true, isError: false };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return { ...state, isLoading: false, isError: true };
    default:
      throw new Error();
  }
};

function App() {
  const { Fragment, useState } = React;
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Display 6 exchange rates per page

  const [{ data, isLoading, isError }] = useDataApi(
    "https://api.frankfurter.app/latest?base=USD",
    { rates: {} }
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const rates = Object.entries(data.rates);
  const currentRates = paginate(rates, currentPage, pageSize);

  return (
    <Fragment>
      <div className="container mt-5">
        <h1 className="text-center mb-4">Today's Exchange Rates (USD Base)</h1>

        {isError && (
          <div className="alert alert-danger">Error loading data.</div>
        )}

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="row">
            {currentRates.map(([currency, rate]) => (
              <ExchangeRateCard
                key={currency}
                currency={currency}
                rate={rate}
              />
            ))}
          </div>
        )}

        <Pagination
          items={rates}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          currentPage={currentPage}
        />
      </div>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
