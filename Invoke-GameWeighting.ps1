$dockerArguments = @(
    'run',
    '-i',
    '-t',
    '--rm',
    '--mount',
    'source=game-weighting-credentials,destination=/home/game-weighting/.googleapis',
    'game-weighting:1.0.0'
)

& docker $dockerArguments
