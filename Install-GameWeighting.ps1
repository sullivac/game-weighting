$dockerArguments = @(
    'build',
    '-t',
    'game-weighting:1.0.0',
    '.'
)

& docker $dockerArguments
