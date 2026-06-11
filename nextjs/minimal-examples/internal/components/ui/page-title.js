import {useRouter} from 'next/router';

export const PageTitle = ({title, withBackButton}) => {
    const router = useRouter();

    const goBack = async () => {
        await router.push('/');
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                marginTop: '30px',
                marginBottom: '60px',
            }}
        >
            <span>
                {withBackButton && (
                    <button onClick={goBack}>
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M14.8609 8.14645C15.0562 8.34171 15.0562 8.65829 14.8609 8.85355L11.215 12.5013L14.8609 16.1479C15.0562 16.3432 15.0562 16.6598 14.8609 16.855C14.6657 17.0503 14.3491 17.0503 14.1538 16.855L9.80078 12.5013L14.1538 8.14645C14.3491 7.95118 14.6657 7.95118 14.8609 8.14645Z"
                                fill="#000624"
                            />
                        </svg>
                        {" Back"}
                    </button>
                )}
            </span>
            <h1>{title}</h1>
        </div>
    );
};
