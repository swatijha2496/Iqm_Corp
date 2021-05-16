import React, { useEffect, useState } from 'react';
import { ListGroup, Modal, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const BASE_URL = 'https://api.stackexchange.com/2.2';

// Main JSON response object
interface IQuestionDetails {
  items: Array<qDetails> // items array
}

// object inside items array
interface qDetails {
  question_id: number,
  owner: ownerDetails,
  title: string,
  creation_date: Date,
  body: string,
  link: string
}

// owner object
interface ownerDetails {
  user_id: number,
  user_type: string,
  display_name: string,
  link: string
}

const container = {
  margin: '8vh'
};

// const defaultQuestions: IQuestionDetails[] = [];

const StackOverFlowQuestions = () => {
  // Tried with array but failed as had to put two loops in render and that won't work as well.
  // const [questions, setQuestions]: [IQuestionDetails[], (questions: IQuestionDetails[]) => void] = useState(
  //   defaultQuestions
  // );
  const [questions, setQuestions] = useState<IQuestionDetails>({ items: [] });

  // Modal show/hide
  const [show, setShow]: [
    boolean,
    (show: boolean) => void
  ] = useState<boolean>(false);

  // Infinite scrolling status
  const [isFetching, setIsFetching]: [
    boolean,
    (isFetching: boolean) => void
  ] = useState<boolean>(false);

  // Infinite scrolling status
  const [errorShow, setErrorShow]: [
    boolean,
    (errorShow: boolean) => void
  ] = useState<boolean>(false);

  // Page count for fetching more quesions from diff pages without touching existing quesions.
  const [pageCount, setPageCount]: [
    number,
    (pageCount: number) => void
  ] = useState<number>(1);

  useEffect(() => {
    document.title = 'Stack Overflow Questions';
    fetchQuesions(pageCount);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isFetching) return;
    fetchQuesions(pageCount);
  }, [isFetching]);

  const fetchQuesions = (pageNo: number) => {
    let filters = {
      pageNo,
      pageSize: 10,
      sortOrder: 'asc', // or desc
      searchText: 'javascript'
    }
    try {
      // Tried with array but failed as had to put two loops in render and that won't work as well.
      // axios.get<IQuestionDetails[]>(`${BASE_URL}/questions?page=${filters.pageNo}&pagesize=${filters.pageSize}&order=${filters.sortOrder}&sort=activity&tagged=${filters.searchText}&site=stackoverflow&filter=!51P7F*pL)z99hOG4K9cuAMzj)VhB(xX6ZIv8xf`,
      axios.get<IQuestionDetails>(`${BASE_URL}/questions?page=${filters.pageNo}&pagesize=${filters.pageSize}&order=${filters.sortOrder}&sort=activity&tagged=${filters.searchText}&site=stackoverflow&filter=!51P7F*pL)z99hOG4K9cuAMzj)VhB(xX6ZIv8xf`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        })
        .then((questionDetails) => {
          if (questions.items.length === 0) {
            // set questions if no data.
            setQuestions(questionDetails.data);
          } else {
            // could not merge questions as i can not get access to items here.
            // setQuestions([...questions.items, ...questionDetails.data.items]);
          }
          setIsFetching(false);
          // increment page counter
          setPageCount(pageCount + 1);
        }).catch(() => {
          setIsFetching(false);
          setErrorShow(true);
        });
    } catch (error) {
      console.log(error);
    }
  }

  function handleScroll() {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) return;
    setIsFetching(true);
  }

  const handleClose = () => setShow(false);

  // Show Question Details in Modal
  function quesionsModal(question: qDetails) {
    return (
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{question.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {question.body}
          <p>Link: <a href={question.link}>{question.link}</a></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // Alert on error
  function ErrorAlert() {
    if (errorShow) {
      return (
        <Alert variant="danger" onClose={() => setErrorShow(false)} dismissible>
          <Alert.Heading>Too many requests from this IP!</Alert.Heading>
        </Alert>
      );
    }
  }

  return (
    <>
      {ErrorAlert()}
      <div className="App" style={container}>
        <h3 className="mb-5">Stack Overflow Quesions</h3>
        <ListGroup className="mb-3">
          {questions.items.length && questions.items.map((ques) => (
            <>
              <ListGroup.Item onClick={(e) => setShow(true)}>
                <ul>
                  <li>
                    <h4>Author: </h4>
                    <h6>{ques.owner.display_name}</h6>
                  </li>
                  <li>
                    <h4>Title: </h4>
                    <h6>{ques.title}</h6>
                  </li>
                  <li>
                    <h4>Creation Date: </h4>
                    <h6>{ques.creation_date}</h6>
                  </li>
                </ul>
              </ListGroup.Item>
              {quesionsModal(ques)}
            </>
          ))
          }
        </ListGroup>
        {isFetching && 'Fetching more list items...'}
      </div>
    </>
  );
}

export default StackOverFlowQuestions;
